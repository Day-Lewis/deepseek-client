import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { DEEPSEEK_CHAT_QUERY } from '../graphql-operations';

const DeepseekChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [getResponse, { loading, error, data }] = useLazyQuery(DEEPSEEK_CHAT_QUERY);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      getResponse({ 
        variables: { 
          prompt, 
          model: model || undefined,
          systemPrompt: systemPrompt || undefined
        } 
      });
    }
  };
  
  return (
    <div className="chat-container">
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入你的问题..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !prompt.trim()}>
          发送 {loading && <span className="loading"></span>}
        </button>
      </form>
      
      <div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
        </button>
        
        {showAdvanced && (
          <div className="advanced-options">
            <div>
              <h4>模型选择</h4>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              >
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-coder">deepseek-coder</option>
              </select>
            </div>
            
            <div>
              <h4>系统提示词</h4>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px' }}
                placeholder="可选的系统提示词..."
              />
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          错误: {error.message}
        </div>
      )}
      
      {data?.deepseekChat && (
        <div className="chat-response">
          <strong>回复:</strong>
          <p>{data.deepseekChat.choices[0]?.message.content || '无回复内容'}</p>
          
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <p>模型: {data.deepseekChat.model}</p>
            <p>Token 使用: {data.deepseekChat.usage?.total_tokens || '未知'} 
              (提示: {data.deepseekChat.usage?.prompt_tokens || '未知'}, 
              生成: {data.deepseekChat.usage?.completion_tokens || '未知'})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepseekChat;