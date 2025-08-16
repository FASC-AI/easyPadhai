import { Button } from "./button"

const HeaderAddEditPage = () => {
    return (
        
            <div className="flex flex-row justify-between w-full px-4 py-3 border-b border-[#DCDCDC] sticky top-0 z-50 bg-white">
               
                <div></div>
                <div className="flex flex-row gap-3">
                    <Button type='button' variant="outline" className="w-full cursor-pointer" >
                        Cancel
                    </Button>
                    <Button type='submit' className="w-full cursor-pointer" >
                         Save
                    </Button>
                    
                </div>
            </div>
    )
}

export default HeaderAddEditPage