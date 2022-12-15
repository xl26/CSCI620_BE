var mongoose = require('mongoose');
var Schema = mongoose.Schema;

categorySchema = new Schema( {
    name: String,
	description: String,
    is_delete: { type: Boolean, default: false },
	date_aq : { type : Date, default: Date.now }
}),
category = mongoose.model('category', categorySchema,'category');

module.exports = category;