var mongoose = require('mongoose');
var Schema = mongoose.Schema;

productSchema = new Schema( {
	name: String,
	desc: String,
	approx_v: Number,
	image: String,
	ins_v: Number,
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date_aq : { type : Date, default: Date.now }
}),
product = mongoose.model('product', productSchema);

module.exports = product;