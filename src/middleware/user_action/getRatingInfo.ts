
import { Review } from "../../models/Review";
import { ProductProps } from "../../types/types";



export const getRatingInfo=async(product:ProductProps,newStar:number)=>{


     let stars =await Review.find({product:product._id}).select("star")

     let fiveStars=0;
     let fourStars=0;
     let threeStars=0;
     let twoStars=0;
     let oneStars=0;


     stars.forEach((s)=>{

        if(s.star==5) fiveStars+=1;
        if(s.star==4) fourStars+=1;
        if(s.star==3) threeStars +=1;
        if(s.star==2) twoStars+=1;
        if(s.star==1) oneStars+=1;
     })

     if(newStar==5) fiveStars+=1;

     if(newStar==4) fourStars+=1;

     if(newStar==3) threeStars+=1;

     if(newStar==2) twoStars+=1;

     if(newStar==1)  oneStars+=1;


     let totalRatingUser= (fiveStars+fourStars+threeStars+twoStars +oneStars)

     let averageStar= (5 * fiveStars + 4 * fourStars+ 3 * threeStars + 2 * twoStars +oneStars)


      return {
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStars,
        averageStar,
        totalRatingUser
         
       }
     }




    
