import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { DEEPSEEK_CHAT_STREAM_MUTATION } from '../graphql-operations';

const DeepseekChatStream: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const [startStreamChat] = useMutation(DEEPSEEK_CHAT_STREAM_MUTATION);
  
  // 清理函数
  const cleanupEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // 清理之前的连接
    cleanupEventSource();
    
    setLoading(true);
    setResponse('');
    setError(null);
    
    try {
      // 获取stream ID
      const result = await startStreamChat({ 
        variables: { 
          prompt, 
          model: model || undefined,
          systemPrompt: systemPrompt || undefined
        } 
      });
      
      const streamId = result.data.deepseekChatStream;
      
      // 创建SSE连接
      const apiUrl = new URL('/stream/' + streamId, 'lewis-cloudflare-worker.lewis-cn-5656.workers.dev');
      const eventSource = new EventSource(apiUrl.toString());
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chunk' && data.data?.choices?.[0]?.delta?.content) {
            setResponse((prev) => prev + data.data.choices[0].delta.content);
          } else if (data.type === 'error') {
            setError(data.error || '发生未知错误');
            cleanupEventSource();
            setLoading(false);
          } else if (data.type === 'done') {
            cleanupEventSource();
            setLoading(false);
          }
        } catch (e) {
          console.error('解析事件数据失败:', e);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('SSE 连接错误:', err);
        setError('流式连接出错，请重试');
        cleanupEventSource();
        setLoading(false);
      };
      
    } catch (err: any) {
      setError(err.message || '启动流式聊天失败');
      setLoading(false);
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
          错误: {error}
        </div>
      )}
      
      {(response || loading) && (
        <div className="chat-response">
          <strong>流式回复:</strong>
          <p>
            {response}
            {loading && <span className="stream-token">▋</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeepseekChatStream;