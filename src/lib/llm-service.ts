import OpenAI from 'openai';
import { LLM_CONFIG } from './llm-config';
import { generateAppSchema, getAvailableTemplates } from './app-templates';

interface LLMResponse {
  action: 'create_app' | 'open_app' | 'chat' | 'show_templates';
  appName?: string;
  appType?: string;
  appSchema?: any;
  message: string;
  thinking?: string[];
}

class LLMService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: LLM_CONFIG.apiKey,
      baseURL: LLM_CONFIG.baseURL,
      dangerouslyAllowBrowser: true // 只在开发环境使用，生产环境应该通过后端API
    });
  }

  async processMessage(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<LLMResponse> {
    try {
      // 添加思考步骤的系统提示
      const enhancedSystemPrompt = LLM_CONFIG.systemPrompt + `

你是OpenImagine WebOS的智能应用生成助手。你可以理解用户的自然语言需求，并动态生成应用程序的配置。

当你需要创建应用时，请分析用户需求并直接生成完整的应用Schema。

应用Schema生成规则：
1. 分析用户需要什么类型的应用或工具
2. 确定需要的输入字段（数字、文本、选择、文本域等）
3. 确定计算逻辑（数学公式、条件判断等）
4. 确定输出结果格式

返回格式（包含思考过程）：
{
  "action": "create_app",
  "thinking": [
    "1. 分析用户需求：理解用户想要创建什么类型的应用",
    "2. 设计输入字段：确定需要哪些用户输入",
    "3. 设计计算逻辑：确定如何计算结果",
    "4. 生成应用Schema：创建完整的应用配置"
  ],
  "appSchema": {
    "title": "应用标题",
    "description": "应用描述",
    "layout": "single-column",
    "components": [
      {
        "type": "number",
        "id": "input1",
        "label": "输入字段1",
        "placeholder": "请输入...",
        "required": true,
        "validation": {"min": 0}
      }
    ],
    "calculations": [
      {
        "type": "formula",
        "expression": "input1 * 2",
        "outputs": ["结果"]
      }
    ]
  },
  "message": "用户友好的创建确认消息"
}

支持的组件类型：
- "input": 文本输入框
- "number": 数字输入框
- "select": 下拉选择框（需要options数组）
  - 字符串格式: ["选项1", "选项2", "选项3"]
  - 对象格式: [{"value": "option1", "label": "选项1"}, {"value": "option2", "label": "选项2"}]
- "textarea": 多行文本框

支持的计算类型：
- "formula": 数学公式计算（可以使用变量名和Math函数）
- "conditional": 条件判断（用于复杂的逻辑处理）

如果用户询问可以创建什么类型的应用，回复：
{
  "action": "show_templates",
  "thinking": ["用户想了解可以创建的应用类型"],
  "message": "我可以帮您创建各种计算器和工具应用！基于您的自然语言描述，AI会动态生成完全定制的应用程序。请告诉我您想要什么类型的应用，比如：BMI计算器、房贷计算器、投资回报计算器、汇率转换器、温度转换器、年龄计算器、倒计时器、百分比计算器等等。我会根据您的具体需求，创建输入字段、计算逻辑和显示界面！"
}

BMI计算器示例：
{
  "action": "create_app",
  "thinking": ["分析用户需求：创建BMI计算器", "设计输入字段：身高(cm)、体重(kg)", "设计计算逻辑：BMI = 体重(kg) / (身高(m)²)", "生成应用Schema：完整配置"],
  "appSchema": {
    "title": "BMI计算器",
    "description": "根据身高和体重计算身体质量指数",
    "layout": "single-column",
    "components": [
      {
        "type": "number",
        "id": "height",
        "label": "身高 (cm)",
        "placeholder": "请输入身高",
        "required": true,
        "validation": {"min": 50, "max": 250}
      },
      {
        "type": "number",
        "id": "weight",
        "label": "体重 (kg)",
        "placeholder": "请输入体重",
        "required": true,
        "validation": {"min": 20, "max": 300}
      }
    ],
    "calculations": [
      {
        "type": "formula",
        "expression": "weight / ((height / 100) * (height / 100))",
        "outputs": ["BMI"]
      },
      {
        "type": "conditional",
        "expression": "BMI_category",
        "outputs": ["bmiStatus"]
      }
    ]
  },
  "message": "已为您创建BMI计算器！请输入您的身高和体重来计算BMI指数。"
}`;

      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversationHistory.slice(-5), // 保留最近5条对话历史
        { role: 'user', content: userMessage }
      ];

      console.log('🤔 LLM开始思考处理用户请求:', userMessage);

      const completion = await this.client.chat.completions.create({
        model: LLM_CONFIG.model,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('📝 LLM原始响应:', response);

      // 尝试解析JSON响应
      try {
        const jsonResponse = JSON.parse(response);

        // 如果有思考过程，打印到控制台
        if (jsonResponse.thinking && jsonResponse.thinking.length > 0) {
          console.log('💭 LLM思考过程:');
          jsonResponse.thinking.forEach((step: string, index: number) => {
            console.log(`   ${index + 1}. ${step}`);
          });
        }

        // 处理不同类型的响应
        const processedResponse: LLMResponse = {
          ...jsonResponse,
          message: jsonResponse.message || response
        };

        // 如果是创建应用，直接使用AI生成的appSchema
        if (processedResponse.action === 'create_app' && processedResponse.appSchema) {
          // 验证生成的Schema是否有效
          if (this.validateAppSchema(processedResponse.appSchema)) {
            console.log('✅ AI成功生成应用Schema:', processedResponse.appSchema.title);
          } else {
            // 如果Schema无效，回退到聊天模式
            processedResponse.action = 'chat';
            processedResponse.message = '抱歉，我在生成应用配置时遇到了问题。请尝试更详细地描述您需要的应用功能。';
          }
        }

        // 如果是显示模板，显示AI可以生成的应用类型
        if (processedResponse.action === 'show_templates') {
          processedResponse.message = `我可以帮您创建各种计算器和工具应用！基于您的自然语言描述，AI会动态生成完全定制的应用程序。

请告诉我您想要什么类型的应用，比如：
• BMI计算器、房贷计算器、投资回报计算器
• 汇率转换器、温度转换器、单位转换器
• 年龄计算器、倒计时器、百分比计算器
• 个税计算器、小费计算器、折扣计算器
• 或者任何您需要的其他计算工具

我会根据您的具体需求，创建输入字段、计算逻辑和显示界面！`;
        }

        return processedResponse;
      } catch {
        // 如果不是JSON格式，返回普通聊天响应
        console.log('💬 普通聊天响应');
        return {
          action: 'chat',
          message: response
        };
      }
    } catch (error) {
      console.error('❌ LLM API Error:', error);
      return {
        action: 'chat',
        message: '抱歉，我现在遇到了一些技术问题。您可以尝试稍后再试，或者我可以帮您打开现有的应用程序。'
      };
    }
  }

  
  // 验证应用Schema的有效性
  validateAppSchema(schema: any): boolean {
    if (!schema) return false;

    // 检查必需的基本字段
    if (!schema.title || !schema.description || !schema.components || !schema.calculations) {
      return false;
    }

    // 检查components是否为数组
    if (!Array.isArray(schema.components) || schema.components.length === 0) {
      return false;
    }

    // 检查calculations是否为数组
    if (!Array.isArray(schema.calculations) || schema.calculations.length === 0) {
      return false;
    }

    // 检查每个组件的有效性
    for (const component of schema.components) {
      if (!component.type || !component.id || !component.label) {
        return false;
      }

      // 检查组件类型是否支持
      const supportedTypes = ['input', 'number', 'select', 'textarea'];
      if (!supportedTypes.includes(component.type)) {
        return false;
      }

      // 如果是select类型，必须有options
      if (component.type === 'select' && (!component.options || !Array.isArray(component.options))) {
        return false;
      }

      // 验证options数组的内容
      if (component.type === 'select' && component.options) {
        for (const option of component.options) {
          if (typeof option !== 'string' && typeof option !== 'object') {
            return false;
          }
          if (typeof option === 'object' && (!option.value || !option.label)) {
            return false;
          }
        }
      }
    }

    // 检查每个计算的有效性
    for (const calc of schema.calculations) {
      if (!calc.type || !calc.expression || !calc.outputs) {
        return false;
      }

      // 检查计算类型是否支持
      const supportedTypes = ['formula', 'conditional'];
      if (!supportedTypes.includes(calc.type)) {
        return false;
      }

      // 检查outputs是否为数组
      if (!Array.isArray(calc.outputs) || calc.outputs.length === 0) {
        return false;
      }
    }

    return true;
  }
}

export const llmService = new LLMService();