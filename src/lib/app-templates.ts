import { AppSchema } from '@/components/dynamic/AppGenerator';

// 通用应用模板 - 基础框架，由LLM根据用户需求动态填充内容
export const UNIVERSAL_TEMPLATE: AppSchema = {
  title: '自定义应用',
  description: '根据您的需求创建的应用',
  layout: 'single-column',
  components: [],
  calculations: []
};

// 根据用户输入生成应用Schema - 简化版本，仅提供基础模板
export function generateAppSchema(userInput: string, _appType?: string): AppSchema | null {
  // 直接返回基础模板，让LLM根据用户需求动态生成完整的应用配置
  return {
    ...UNIVERSAL_TEMPLATE,
    title: '自定义应用',
    description: `基于您的需求创建的应用: ${userInput}`
  };
}

// 获取基础模板信息
export function getAvailableTemplates(): Array<{ id: string; name: string; description: string }> {
  return [
    {
      id: 'universal',
      name: '通用应用生成器',
      description: 'AI根据您的自然语言描述，动态生成任何类型的计算器或工具应用'
    }
  ];
}

// 提供一些常见的组件类型示例，用于LLM生成时的参考
export const COMPONENT_EXAMPLES = {
  input: {
    type: 'input',
    id: 'example_input',
    label: '输入字段',
    placeholder: '请输入...',
    required: true
  },
  number: {
    type: 'number',
    id: 'example_number',
    label: '数字输入',
    placeholder: '请输入数字',
    required: true,
    validation: { min: 0, max: 100 }
  },
  select: {
    type: 'select',
    id: 'example_select',
    label: '选择项',
    required: true,
    options: ['选项1', '选项2', '选项3']
  },
  textarea: {
    type: 'textarea',
    id: 'example_textarea',
    label: '多行文本',
    placeholder: '请输入详细内容...',
    required: false
  }
};

// 提供一些常见的计算类型示例
export const CALCULATION_EXAMPLES = {
  formula: {
    type: 'formula',
    expression: 'input1 + input2',
    outputs: ['计算结果']
  },
  conditional: {
    type: 'conditional',
    expression: 'score >= 60 ? "及格" : "不及格"',
    outputs: ['评价结果']
  }
};