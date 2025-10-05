import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_STYLES, DYNAMIC_APP_DEFAULTS } from '@/lib/app-styles';

// 基础UI组件类型定义
export interface UIComponent {
  type: 'input' | 'number' | 'select' | 'textarea' | 'button' | 'text' | 'result';
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: (string | { value: string; label: string })[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AppSchema {
  title: string;
  description: string;
  components: UIComponent[];
  calculations: {
    type: 'formula' | 'conditional' | 'lookup';
    expression: string;
    outputs: string[];
  }[];
  layout: 'single-column' | 'two-column' | 'grid';
}

interface DynamicAppProps {
  schema: AppSchema;
}

export const DynamicApp: React.FC<DynamicAppProps> = ({ schema }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 表单验证
  const validateField = (component: UIComponent, value: any): string | null => {
    if (component.required && (!value || value.toString().trim() === '')) {
      return `${component.label}是必填项`;
    }

    if (component.validation && value) {
      const { min, max } = component.validation;
      const numValue = parseFloat(value);

      if (component.type === 'number' || component.type === 'input') {
        if (!isNaN(numValue)) {
          if (min !== undefined && numValue < min) {
            return `${component.label}不能小于${min}`;
          }
          if (max !== undefined && numValue > max) {
            return `${component.label}不能大于${max}`;
          }
        }
      }
    }

    return null;
  };

  // 处理输入变化
  const handleInputChange = (componentId: string, value: any) => {
    setFormData(prev => ({ ...prev, [componentId]: value }));

    // 清除错误信息
    if (errors[componentId]) {
      setErrors(prev => ({ ...prev, [componentId]: '' }));
    }
  };

  // 执行计算
  const calculate = () => {
    const newErrors: Record<string, string> = {};
    const newResults: Record<string, any> = {};

    // 清除之前的错误
    setErrors({});
    setResults({});

    // 验证所有必填字段
    schema.components.forEach(component => {
      const error = validateField(component, formData[component.id]);
      if (error) {
        newErrors[component.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 执行计算逻辑
    try {
      schema.calculations.forEach(calc => {
        try {
          const calcResults = evaluateCalculation(calc, formData);
          Object.assign(newResults, calcResults);
        } catch (error) {
          console.error('计算错误:', error);
          // 提供更具体的错误信息
          if (error instanceof Error) {
            newResults['error'] = `计算错误: ${error.message}`;
          } else {
            newResults['error'] = '计算过程中出现错误，请检查输入数据';
          }
        }
      });

      // 如果有错误，将其分配到具体的输出字段
      if (newResults['error']) {
        schema.calculations.forEach(calc => {
          if (calc.outputs && calc.outputs.length > 0) {
            calc.outputs.forEach((outputName: string) => {
              if (!newResults[outputName]) {
                newResults[outputName] = '无法计算';
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('计算流程错误:', error);
      const errorResult: Record<string, any> = {};
      schema.calculations.forEach(calc => {
        if (calc.outputs && calc.outputs.length > 0) {
          calc.outputs.forEach((outputName: string) => {
            errorResult[outputName] = '计算失败';
          });
        }
      });
      errorResult['error'] = '计算流程出现错误，请重试';
      setResults(errorResult);
      return;
    }

    setResults(newResults);
  };

  // 评估计算表达式
  const evaluateCalculation = (calculation: any, data: Record<string, any>): Record<string, any> => {
    const outputs: Record<string, any> = {};

    switch (calculation.type) {
      case 'formula':
        // 安全的表达式计算
        outputs[calculation.outputs[0]] = evaluateFormula(calculation.expression, data);
        break;

      case 'conditional':
        // 条件逻辑计算
        const condition = evaluateCondition(calculation.expression, data);
        if (calculation.outputs && calculation.outputs.length > 0) {
          // 如果是BMI计算，分别输出BMI值和健康状态
          if (calculation.expression.includes('BMI') || calculation.expression.includes('BMI_category')) {
            if (condition.includes('|')) {
              const parts = condition.split('|').map((part: string) => part.trim());
              const bmiPart = parts.find(part => part.includes('BMI:'));
              const statusPart = parts.find(part => part.includes('健康状态:'));

              if (bmiPart) {
                const bmiMatch = bmiPart.match(/BMI:\s*([\d.]+)/);
                if (bmiMatch) outputs['BMI'] = bmiMatch[1];
              }
              if (statusPart) {
                outputs['bmiStatus'] = statusPart.replace('健康状态:', '').trim();
              }
            } else {
              // 兼容旧格式
              const bmiMatch = condition.match(/BMI:\s*([\d.]+)/);
              const statusMatch = condition.match(/\(([^)]+)\)/);

              if (bmiMatch) outputs['BMI'] = bmiMatch[1];
              if (statusMatch) outputs['bmiStatus'] = statusMatch[1];
            }
          } else {
            // 其他条件计算的结果分配
            calculation.outputs.forEach((outputName: string, index: number) => {
              if (condition.includes('|')) {
                // 如果结果包含多个值，分别分配
                const parts = condition.split('|').map((part: string) => part.trim());
                outputs[outputName] = parts[index] || condition;
              } else {
                outputs[outputName] = condition;
              }
            });
          }
        } else {
          outputs['result'] = condition;
        }
        break;

      case 'lookup':
        // 查找表逻辑
        outputs[calculation.outputs[0]] = lookupValue(calculation.expression, data);
        break;
    }

    return outputs;
  };

  // 安全的公式计算
  const evaluateFormula = (formula: string, data: Record<string, any>): number | string => {
    // 温度转换的特殊处理
    if (formula.includes('from_unit') && formula.includes('to_unit')) {
      const temperature = parseFloat(data.temperature || data['温度值'] || 0);
      const fromUnit = data.from_unit || data['源单位'];
      const toUnit = data.to_unit || data['目标单位'];

      // 摄氏度转换
      if (fromUnit.includes('摄氏度') && toUnit.includes('华氏度')) {
        return (temperature * 9/5 + 32).toFixed(1) + ' °F';
      }
      if (fromUnit.includes('摄氏度') && toUnit.includes('开尔文')) {
        return (temperature + 273.15).toFixed(1) + ' K';
      }

      // 华氏度转换
      if (fromUnit.includes('华氏度') && toUnit.includes('摄氏度')) {
        return ((temperature - 32) * 5/9).toFixed(1) + ' °C';
      }
      if (fromUnit.includes('华氏度') && toUnit.includes('开尔文')) {
        return ((temperature - 32) * 5/9 + 273.15).toFixed(1) + ' K';
      }

      // 开尔文转换
      if (fromUnit.includes('开尔文') && toUnit.includes('摄氏度')) {
        return (temperature - 273.15).toFixed(1) + ' °C';
      }
      if (fromUnit.includes('开尔文') && toUnit.includes('华氏度')) {
        return ((temperature - 273.15) * 9/5 + 32).toFixed(1) + ' °F';
      }

      return temperature.toString();
    }

    // 百分比计算的特殊处理
    if (formula.includes('calculation_type')) {
      const calcType = data.calculation_type || data['计算类型'];
      const partValue = parseFloat(data.part_value || data['部分值'] || 0);
      const totalValue = parseFloat(data.total_value || data['总值'] || 0);
      const percentage = parseFloat(data.percentage || data['百分比'] || 0);

      if (calcType.includes('计算百分比')) {
        return totalValue > 0 ? ((partValue / totalValue) * 100).toFixed(2) + '%' : '0%';
      }
      if (calcType.includes('已知百分比计算部分值')) {
        return (totalValue * percentage / 100).toFixed(2);
      }
      if (calcType.includes('已知百分比计算总值')) {
        return percentage > 0 ? (partValue * 100 / percentage).toFixed(2) : '0';
      }
    }

    // 普通数学公式计算
    // 替换变量
    let expression = formula;
    Object.keys(data).forEach(key => {
      const value = parseFloat(data[key]) || 0;
      expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
    });

    // 安全的数学表达式计算（只允许数字和基本运算符）
    const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');

    try {
      // 检查表达式是否为空或无效
      if (!safeExpression || safeExpression.trim() === '') {
        throw new Error('计算表达式为空');
      }

      // 检查是否有未定义的变量
      const undefinedVars = expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      for (const varName of undefinedVars) {
        if (!data[varName] && !['Math', 'Number', 'parseInt', 'parseFloat'].includes(varName)) {
          throw new Error(`缺少输入值: ${varName}`);
        }
      }

      const result = Function(`"use strict"; return (${safeExpression})`)();

      if (isNaN(result)) {
        throw new Error('计算结果不是有效数字');
      }

      if (!isFinite(result)) {
        throw new Error('计算结果超出范围');
      }

      return typeof result === 'number' ? result : '计算错误';
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('计算表达式无效');
    }
  };

  // 条件评估
  const evaluateCondition = (condition: string, data: Record<string, any>): string => {
    // BMI计算
    if (condition.includes('BMI') || condition.includes('calculateAge') || condition.includes('calculateCountdown') || condition.includes('calculateIdealWeight')) {
      // BMI计算
      if (condition.includes('BMI') || condition.includes('BMI_category')) {
        const height = parseFloat(data.height || data['身高'] || 0);
        const weight = parseFloat(data.weight || data['体重'] || 0);

        if (height > 0 && weight > 0) {
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);

          let status = '';
          if (bmi < 18.5) status = '偏瘦';
          else if (bmi < 24) status = '正常';
          else if (bmi < 28) status = '偏胖';
          else status = '肥胖';

          return `BMI: ${bmi.toFixed(1)}|健康状态: ${status}`;
        }
        return '请输入有效的身高和体重|无法计算';
      }

      // 年龄计算
      if (condition.includes('calculateAge')) {
        const birthDate = data.birth_date || data['出生日期'];
        const targetDate = data.target_date || data['目标日期'] || new Date().toISOString().split('T')[0];

        if (birthDate) {
          try {
            const birth = new Date(birthDate);
            const target = new Date(targetDate);

            let age = target.getFullYear() - birth.getFullYear();
            const monthDiff = target.getMonth() - birth.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
              age--;
            }

            const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

            return `${age} 岁 (${totalDays} 天)`;
          } catch {
            return '日期格式错误';
          }
        }
        return '请输入出生日期';
      }

      // 倒计时计算
      if (condition.includes('calculateCountdown')) {
        const targetDate = data.target_date || data['目标时间'];

        if (targetDate) {
          try {
            const target = new Date(targetDate);
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
              return '目标时间已过';
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
          } catch {
            return '日期格式错误';
          }
        }
        return '请输入目标时间';
      }

      // 理想体重计算
      if (condition.includes('calculateIdealWeight')) {
        const height = parseFloat(data.height || data['身高'] || 0);
        const gender = data.gender || data['性别'];
        const formula = data.formula || data['计算公式'];

        if (height > 0) {
          let idealWeight = 0;
          let weightRange = '';

          if (formula.includes('BMI') || !formula) {
            // BMI标准：18.5-24
            const heightInMeters = height / 100;
            idealWeight = 22 * heightInMeters * heightInMeters;
            const minWeight = 18.5 * heightInMeters * heightInMeters;
            const maxWeight = 24 * heightInMeters * heightInMeters;
            weightRange = `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`;
          } else if (formula.includes('Broca')) {
            // Broca公式
            idealWeight = gender === '男性' ? (height - 100) * 0.9 : (height - 100) * 0.85;
            weightRange = `${(idealWeight * 0.9).toFixed(1)} - ${(idealWeight * 1.1).toFixed(1)} kg`;
          } else if (formula.includes('Devine')) {
            // Devine公式
            idealWeight = gender === '男性' ? 50 + 2.3 * (height - 152.4) / 2.54 : 45.5 + 2.3 * (height - 152.4) / 2.54;
            weightRange = `${(idealWeight * 0.9).toFixed(1)} - ${(idealWeight * 1.1).toFixed(1)} kg`;
          }

          return `理想体重: ${idealWeight.toFixed(1)} kg\n合理范围: ${weightRange}\nBMI推荐: 18.5 - 24`;
        }
        return '请输入有效的身高';
      }
    }

    return '无法计算';
  };

  // 查找值
  const lookupValue = (key: string, data: Record<string, any>): any => {
    return data[key] || '未知';
  };

  // 重置表单
  const reset = () => {
    setFormData({});
    setResults({});
    setErrors({});
  };

  // 渲染组件
  const renderComponent = (component: UIComponent) => {
    const value = formData[component.id] || '';
    const error = errors[component.id];

    switch (component.type) {
      case 'input':
      case 'number':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={component.type}
              value={value}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              placeholder={component.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              placeholder={component.placeholder}
              className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
              rows={3}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">请选择...</option>
              {component.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value || option.label || String(option) : option;
                const optionLabel = typeof option === 'object' ? option.label || option.value || String(option) : option;
                return (
                  <option key={`${component.id}-option-${index}-${optionValue}`} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'text':
        return (
          <div key={component.id} className="text-sm text-gray-600">
            {component.label}
          </div>
        );

      default:
        return null;
    }
  };

  // 渲染结果
  const renderResults = () => {
    if (Object.keys(results).length === 0) return null;

    return (
      <Card className={APP_STYLES.cards.default}>
        <CardHeader>
          <CardTitle className="text-lg">计算结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className={DYNAMIC_APP_DEFAULTS.results.item}>
              <div className={DYNAMIC_APP_DEFAULTS.results.label}>{key}:</div>
              <div className={DYNAMIC_APP_DEFAULTS.results.value}>{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const layoutClass = schema.layout === 'two-column' ? 'grid grid-cols-2 gap-4' : 'space-y-4';

  return (
    <div className={`p-6 h-full ${DYNAMIC_APP_DEFAULTS.container.className}`}>
      <div className={APP_STYLES.layout.container}>
        <div className="text-center mb-6">
          <h1 className={DYNAMIC_APP_DEFAULTS.title.className}>{schema.title}</h1>
          <p className={DYNAMIC_APP_DEFAULTS.description.className}>{schema.description}</p>
        </div>

        <div className={layoutClass}>
          {schema.components.map(renderComponent)}
        </div>

        <div className={DYNAMIC_APP_DEFAULTS.buttons.buttonGroup}>
          <Button
            onClick={calculate}
            className={`flex-1 ${DYNAMIC_APP_DEFAULTS.buttons.calculate}`}
          >
            计算
          </Button>
          <Button
            onClick={reset}
            className={`flex-1 ${DYNAMIC_APP_DEFAULTS.buttons.reset}`}
          >
            重置
          </Button>
        </div>

        {renderResults()}
      </div>
    </div>
  );
};