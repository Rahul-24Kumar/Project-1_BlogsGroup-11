const mongoose = require("mongoose")
const validator = require("validator")
const ObjectId = mongoose.Schema.Types.ObjectId
const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: ObjectId,
        required: true,
        ref: 'authorModel'
    },
    tags: [String],
    category: [String],
    subcategory: [String],
    isPublished: {
        type: Boolean,
        default:false
    },

    publishedAt: {
        type:Date
        
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type:Date

    },



}, { timestamps: true })
module.exports = mongoose.model("blogsModel", blogSchema)