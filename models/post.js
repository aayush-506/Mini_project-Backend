import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    image : String,
    description : String,
    like : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ],
    user : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],
    date : {
        type : Date,
        default : Date.now
    }

})

export default mongoose.model("post", postSchema);