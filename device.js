var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var _ = require('lodash')
var Node = require('./../models/node')
const readJsonSync = require('read-json-sync');

chai.use(chaiHttp);

var node_json = readJsonSync('config/config.json');
var node = new Node(node_json)

describe('/GET req_device', () => {
      it('it should GET all the devices', (done) => {
        chai.request(node.url())
            .get('/req_device')
            .end((err, res) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				
				var body = res.body;
				expect(body).to.have.property('status').that.is.a('number');
                expect(body.status).to.equal(0);
				expect(body).to.have.property('count').that.is.a('number');
				expect(body).to.have.property('devices').that.is.a('array');
				
				var devices = body.devices
				expect(devices).to.be.a('array');
				
				_.map(devices, function(device, index) {
					expect(device).to.have.property('type').that.is.a('string');
					expect(device).to.have.property('node_id').that.is.a('string');
					expect(device).to.have.property('id').that.is.a('number');
					expect(device).to.have.property('state').that.is.a('string');
					
					var type = device.type 
					if (type == 'TOGGLE') {
						var actions = {
							'ON':	'ON',
							'OFF': 	'OFF',
							'TOGGLE': 'ON'
						}
						//send 'ON' => it should be 'ON'
						//send 'OFF' => it should be 'OFF'
						//send 'TOGGLE' => it should be 'ON', because it was be 'OFF' before!
						_.forEach(actions, function(shoulBe, action) {
							describe(`/POST req_device_toggle ${action} #${index} AND check state should be ${shoulBe}`, () => {
								it('it should support ON state', (done) => {
									chai.request(node.url())
										.post('/req_device_toggle')
										.send({	
											"id": index,
											"command": action
										})
										.end((err, res) => {
											expect(res).to.have.status(200);
											expect(res).to.be.json;
											var body = res.body;
											expect(body).to.have.property('status').that.is.a('number');
											expect(body.status).to.equal(0);
											chai.request(node.url())
												.get('/req_device')
												.end((err, res) => {
													expect(res).to.have.status(200);
													expect(res).to.be.json;
													expect(res.body.devices[index].state).to.equal(shoulBe);
													done();
												})
										})
									
									
									
								})
							})
						})
					} else {
						describe(`Sensor #${index}`, () => {
							it('it should be connected with sensor', (done) => {
								expect(device.state).to.not.equal('NOT_CONNECTED')
								done();
							})
						})
					}
				})
              done();
            });
      });
  });
