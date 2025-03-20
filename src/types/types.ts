


export type UserProps={
    email:string,
    password:string,
    loginDomain:string,
    restPasswordLink:string,
    emailVerifyLink:string,
    isBlocked:string;
    _id:string,
    role:string,
    photo:string,
    phone:string
}

type role="admin"|"superadmin"


export type NotificationProp={

    admin:String
    notifications:[{
        notificationType:string
        notificationDetail:object,
        hasRead:boolean
        date:string
    }],
    noOfUnseen:number,
    _id:string
}

export type AdminProps={

    name:string
    _id:string
    shopname:string,
    geolocation:{
        type:string,
        coordinates:string[]
    }
    address:string
    shippingRate:number
    shippingCost:number
    district:string
    muncipality:string
    wardno:number
    businessInfo:string
    adminBank:string
    adminWareHouse:string
    phone:number
    email:string
    password:string
    photo:string
    holidayMode:{
        start:number
        end:number
    },
    salt:string
    role:role
    resetPasswordLink:string
    emailVerifyLink:string
    isVerified: string
    isBlocked:string

}




export type CategoriesProps={

    systemName:string
    displayName:string,
    parent:ProductBrandProps
    brands:string[]
    slug:string
    isDisabled:string,
    _id:string

}



export type FilesProps={
    
    fieldname:string,
    originalname:string,
    encoding:string,
    mimetype:string,
    path:string ,
    size:number,
    filename:string 
  
}

export type DispatchProps={

    email:string,
    name:string
    password:string,
    address:string,
    restPasswordLink:string,
     phone:number
    isBlocked:string;
    _id:string,
   

}

export type ProductImagesProps={

    thumbnail:string
    _id:string,
    medium:string
    large:string
    productLink:ProductProps
   
}

export type ProductBrandProps={
    brandName:string
    systemName:string
    slug:string
    _id:string
}

export type RemarkProps={
    comment:string
    isDeleted:string
    _id:string
}

export type ProductProps={
     _id:string
    name:string
    brand:ProductBrandProps
    quantity:number
    category:CategoriesProps
    averageRating:number
    totalRatingUser:number
    soldBy:AdminProps
    images:ProductImagesProps[]
    warranty:string
    return:string
    size:string[]
    model:string
    color:string[]
    weight:string[]
    description:string
    highlights:string
    tags:string[]
    price:number
    discountRate:number
    videoURL:string[]
    isVerified:string
    isRejected:string
    isDeleted:string
    isFeatured:string
    viewsCount:number
    trendingScore:number
    noOfSoldOut:number
    slug:string
    availableDistricts:string[]
    remark:RemarkProps


}

export type PaymentProps={

    user:UserProps
    order:OrderProps
    method: string
    shippingCharge:string
    amount:string
    returnedAmount:string
    transactionCode:string
    from:number
    isDeleted:string
    _id:string

}


export type MyQuery={
    page?:number
    createdAt?:"asc"|"desc",
    updatedAt:"asc"|"desc",
    price?:"1"|"-1",
    status?: 'verified' | 'unverified' | 'rejected',
    name?:string,
    keyword?:string,
    outofstock?:"yes"|"no"

}


export type OrderProps={
    _id:string
    user:UserProps
    orderID:string
    product:ProductProps
    payment:PaymentProps
    quantity:Number
    soldBy:AdminProps
    status: {
        currentStatus:string
        activeDate:string
        approvedDate:string
        dispatchedDetail: {
            dispatchedDate:string
            dispatchedBy:DispatchProps
        },
        cancelledDetail: {
            cancelledDate:string
            cancelledByUser:string
            cancelledByAdmin:string
            remark:string
        },
        completedDate:string
        tobereturnedDate:string
        // tobeReturnedDetail: {
        //     tobereturnedDate: {
        //         type: Date
        //     },
        //     remark: {
        //         type: Schema.Types.ObjectId,
        //         ref: 'remark'
        //     },
        // },        
        returnedDetail: {
            returnedDate:string
            returneddBy:string
            remark:string
        },
        
    },
    shipto:{
        region:string
        city:string
        area:string
        address:string
        geolocation:string
        phoneno:string
    },
    isPaid:boolean
    cancelledByModel:string
    productAttributes:string
    createdAt:string
    updatedAt:string

}

export type CartProps={

    user:UserProps
    product:ProductProps
    quantity:number
    productAttributes:string
    isDeleted:string
    _id:string

}