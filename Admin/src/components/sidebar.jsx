
 import { Database, ListCheck, User2 } from 'lucide-react'
const Sidebar = () => {
    return(
        <>
        <div className="w-[18%] min-h-screen mt-10 p-5 border-r-2">
            <div className="flex flex-col gap-3 ">
                <Link>
                <User2 size={12}/>
                <span>All users</span>
                </Link>

                <Link>
                <ListCheck size={12}/>
                <span>user's interviews</span>
                </Link>
                 
                 <Link>
                 <Database size={12} />
                 <span>API usage</span>
                 </Link>
            </div>

        </div>
        </>
    )
}