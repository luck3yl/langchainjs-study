const port = 3000

async function fetchStream(){
  const response = await fetch(`http://localhost:${port}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: "",
      session_id: "test-server"
    })
  })
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while(true){
    const { done, value } = await reader.read()
    if(done) break;
    console.log(decoder.decode(value))
  }
  console.log("stream finished")
}

fetchStream()