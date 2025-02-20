import { useState } from "react"
import Projects from "./pages/projects/page";

function App(){
  const [page , setPage] = useState("projects");
  
  const changePage = (page : string) =>{
    setPage(page);
  } 

  let content ;

  switch(page){
    case 'projects' : 
    content = (
      <div className=" h-screen w-full">
        <Projects />
      </div>
    )
  }
  return (
    <>
    {content}
    </>
  )
}

export default App
