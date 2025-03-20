
import fs from "fs"

export const fileRemoved=(files:string[])=>{

    return Promise.all(
        files.map((file)=> new Promise ((res,rej)=>{

            try{

                setTimeout(()=>{

                    fs.unlink(file,err=>{
                        if(err) console.log(err)
                            res(file)
                    })


                },10000)


            }catch(err:unknown){
               if(err instanceof Error){
                console.log(err.message)
                rej(err.message)
               }
            }
        }))
    )
}

export const removeImageFile=async(filename:string)=>{

    try{
      const filemagePath=`public/uploads/category/${filename}`

      if(fs.existsSync(filemagePath)){

         await fs.promises.unlink(filemagePath)
      }

    }catch(error:unknown){
        if(error instanceof Error){
            console.log(error.message)
           
        }

    }
    


}