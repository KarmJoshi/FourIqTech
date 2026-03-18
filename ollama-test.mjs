import ollama from 'ollama'

/**
 * Basic test script for Ollama local integration.
 * Requires Ollama server to be running and model pulled.
 */
async function testOllama() {
  console.log('--- Starting Ollama Chat Test (Extreme Loading Mode) ---')
  console.log('Note: Loading a 51GB model on 8GB RAM will take 5-15 minutes. Please BE PATIENT.')
  
  try {
    // We use a manual fetch to bypass the library's default timeout behavior if it persists
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'qwen3-coder-next',
        messages: [{ role: 'user', content: 'Hello! Are you working?' }],
        stream: false
      }),
      // Set an extreme timeout for the request
      signal: AbortSignal.timeout(1800000) // 30 minutes
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Ollama Response:', data.message.content)
  } catch (error) {
    console.error('Detailed Error:', error.message)
    if (error.name === 'TimeoutError') {
      console.error('The request timed out. This is expected for a 51GB model on 8GB RAM.')
    }
  }
  console.log('--- Test Complete ---')
}

testOllama()
