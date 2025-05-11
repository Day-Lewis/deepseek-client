import { gql } from '@apollo/client';

// 标准聊天查询
export const DEEPSEEK_CHAT_QUERY = gql`
  query DeepseekChat($prompt: String!, $model: String, $systemPrompt: String) {
    deepseekChat(prompt: $prompt, model: $model, systemPrompt: $systemPrompt) {
      id
      model
      choices {
        index
        message {
          role
          content
        }
        finish_reason
      }
      usage {
        prompt_tokens
        completion_tokens
        total_tokens
      }
    }
  }
`;

// 流式聊天变更
export const DEEPSEEK_CHAT_STREAM_MUTATION = gql`
  mutation DeepseekChatStream($prompt: String!, $model: String, $systemPrompt: String) {
    deepseekChatStream(prompt: $prompt, model: $model, systemPrompt: $systemPrompt)
  }
`;