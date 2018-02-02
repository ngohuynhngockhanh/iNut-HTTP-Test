const _ = require('lodash')

function Node(options) {
	options = options || {}
	options.version 		= options.version 	|| '1.0'
	options.uuid			= options.uuid		|| 'uuid'
	options.user_token		= options.user_token|| ''
	options.node_id			= options.node_id 	|| ''
	this.options = options
}

var p = Node.prototype

p.url = function() {
	return `http://ourshark.mysmarthome.vn:8099/api/${this.options.version}/request/${this.options.uuid}/${this.options.node_id}/${this.options.user_token}`
}
 
module.exports = Node