var mongoose = require('mongoose');
var Schema = mongoose.Schema;

inventorySchema = new Schema( {
	p_name: String,
	count: String,
	p_id: Schema.ObjectId,
    type: {type : String, enum: ['In', 'Out']},
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date_created : { type : Date, default: Date.now }
}),
inventory = mongoose.model('inventory', inventorySchema,'inventory');

module.exports = inventory;
