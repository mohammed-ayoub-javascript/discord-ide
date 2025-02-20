import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const Projects = () => {
  return (
    <div className=" w-full h-full">
        <div className=" w-full flex justify-between items-center flex-row border border-gray-200 p-3">
            <div className=" text-2xl font-extrabold">
                DISCORD IDE
            </div>
            <div>
                <Button>
                    <Plus />
                </Button>
            </div>
        </div>
    </div>
  )
}

export default Projects