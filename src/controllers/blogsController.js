const blogsModel = require("../models/blogsModel")
const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")

//Creation of blogs
const createBlog = async function (req, res) {
  try {
    let data = req.body
    let author_id = req.body.authorId

    if (!author_id) {
      return res.send("AuthorId is required")
    }
    let authorId = await authorModel.findById(author_id)
    if (!authorId) {
      return res.send('No author is present with the given id')
    }
    if (data) {
      let savedData = await blogsModel.create(data);
      res.status(201).send({ msg: savedData, status: true });
    } else {
      return res.status(400).send({ msg: "invalid data" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Please insert data", status: false });
  }

}

const loginUser = async function (req, res) {
  let userName = req.body.email;
  let password = req.body.password;

  let author = await authorModel.findOne({ email: userName, password: password });
  if (!author)
    return res.send({
      status: false,
      msg: "username or password is not correct",
    });

  let token = jwt.sign(
    {
      authorId: author._id.toString(),
      batch: "thorium",
      organisation: "FunctionUp",
    },
    "Secret Key_group11"
  );
  res.setHeader("x-api-key", token);
  res.send({ status: true, data: token });
};

//Getting blogs where  isPublished:true isDeleted: false and other combinations
const getBlogs = async function (req, res) {
  try {
    let filter = req.query;
    let data = await blogsModel.find({ $and: [filter, { isPublished: true }, { isDeleted: false }] })
    if (data.length === 0) {
      return res.status(404).send({ status: false, msg: "No data found" })
    }
    if (filter.tags == undefined && filter.subcategory == undefined) {
      let blogs = await blogsModel.find({ $and: [filter, { isDeleted: false }, { isPublished: true }] }).populate("authorId")
      return res.status(200).send({ data: blogs })
    }
    if (filter.tags != undefined && filter.subcategory == undefined) {
      let tags = filter.tags
      delete filter.tags;
      let blogs = await blogsModel.find({ $and: [{ tags: { $in: [tags] } }, filter, { isDeleted: false }, { isPublished: true }] }).populate("authorId")
      return res.status(200).send({ data: blogs })
    }
    if (filter.tags == undefined && filter.subcategory != undefined) {
      let subCat = filter.subcategory
      delete filter.subcategory;
      let blogs = await blogsModel.find({ $and: [{ subcategory: { $in: [subCat] } }, filter, { isDeleted: false }, { isPublished: true }] }).populate("authorId")
      return res.status(200).send({ data: blogs })
    }
    if (filter.tags != undefined && filter.subcategory != undefined) {
      let subCat = filter.subcategory
      let tags = filter.tags
      delete filter.subcategory;
      delete filter.tags
      let blogs = await blogsModel.find({ $and: [{ subcategory: { $in: [subCat] } }, { tags: { $in: [tags] } }, filter, { isDeleted: false }, { isPublished: true }] }).populate("authorId")
      return res.status(200).send({ data: blogs })
    }
  } catch (error) {
    return res.status(500).send({ msg: "Error", error: error.message })
  }
}
 
//Updating blogs
const updateblog = async function (req, res) {
  try {
    let updateblog = req.params.blogId
    let update = await blogsModel.findById(updateblog)
    if (!updateblog) {
      return res.status(404).send({ msg: "Invalid Blog" })
    }
    let updatedata = req.body;
    let updatedUser = await blogsModel.findOneAndUpdate({ _id: updateblog }, { title: updatedata.title, body: updatedata.body, tags: updatedata.tags, subcategory: updatedata.subcategory, isPublished:updatedata.isPublished,isDeleted:updatedata.isDeleted }, { new: true, upsert: true });
    res.status(200).send({ status: true, data: updatedUser })

  } catch (err) {
    res.status(500).send({ Error: err.message })
  }
}

//Deleting the blogs by Id
const deleteBlog = async function (req, res) {
  try {
    let deleteblog = req.params.blogId;
    let = await blogsModel.findById(deleteblog)
    if (!deleteblog) {
      return res.status(404).send({ msg: "Is not deleted" });
    }
    let blogId = req.params.blogId;
    let userDel = await blogsModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true ,deletedAt:new Date()}, { new: true });
    res.status(200).send({ status: true, data: userDel })
  } catch (err) {
    res.status(500).send({ Error: err.message })
  }
};

//Deleting the blogs by queries.
const deletebyQuery = async (req, res) => {
 try {
    const data = req.query
    const fetchdata = await blogsModel.find(data)
    if (fetchdata.length == 0) {
      return res.status(404).send({ "status": false, "msg": "blog not found" })
    }

    for (let i = 0; i < fetchdata.length; i++) {
      if (fetchdata[i].isDeleted) {
        return res.status(404).send({ "status": false, "msg": "blog not found" })
      }
    }

    const dataRes = await blogsModel.updateMany(data, { isDeleted: true, deletedAt: new Date() });
    return res.status(200).send({ "status": true, "msg": "blog deleted successfully" })
  } catch (error) {
    return res.status(500).send({
      "error": error.message
    })
  }
}


module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateblog = updateblog
module.exports.deleteBlog = deleteBlog
module.exports.deletebyQuery = deletebyQuery
module.exports.loginUser = loginUser