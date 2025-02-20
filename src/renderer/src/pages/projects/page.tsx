import { ModeToggle } from "@/components/theme/mode-toggle"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const Projects = () => {
  return (
    <div className=" w-full h-full">
        <div className=" w-full flex justify-between items-center flex-row border-b border-gray-200 p-3">
            <div className=" text-2xl font-extrabold cursor-pointer">
                DISCORD IDE
            </div>
            <div className="flex justify-center items-center flex-row gap-2">
                <Button>
                    <Plus />
                </Button>
                <ModeToggle />
            </div>
        </div>
    </div>
  )
}

export default Projects