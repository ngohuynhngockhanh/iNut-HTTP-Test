var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var _ = require('lodash')
var Node = require('./../models/node')
const readJsonSync = require('read-json-sync');

var time = require('locutus/php/datetime/time')

chai.use(chaiHttp);

var node_json = readJsonSync('config/config.json');
var node = new Node(node_json)

describe('/GET req_device', () => {
	it('it should GET at least device expect SENSOR', function(done) {
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
				var device_id = -1
				var device_state = ""
				_.map(devices, (device, index) => {
					if (device.type != "SENSOR") {
						device_id = index
						device_state = device.state
					}
				})
				if (device_id == -1) {
					console.log("This device doesn't support timers")
					done();
				} else {
					setTimeout(() => done(), 1400)
					describe('/GET req_timer - interval type', () => {
						it('it should GET all timers', (done) => {
							chai.request(node.url())
								.get('/req_timer')
								.end((err, res) => {
									expect(res).to.have.status(200);
									expect(res).to.be.json;

									var body = res.body;

									expect(body).to.have.property('status').that.is.a('number');
									expect(body.status).to.equal(0);
									expect(body).to.have.property('free_id').that.is.a('number');
									expect(body).to.have.property('timers').that.is.a('array');

									var free_id = body.free_id

									describe('/POST req_timer_block', () => {
										if (free_id < 0)
											it('it CAN NOT add more timer', (done) => {
												done()
											})
										else {
											it('add INTERVAL 2 second timer', (done) => {
												var data = {
													command: "TOGGLE",
													days_in_week: "0,1,2,3,4,5,6",
													device_id: device_id,
													enabled: 1,
													end: 0,
													excute_at: 2,
													init: false,
													method: "POST",
													name: "",
													start: 0,
													timer_id: free_id,
													timer_type: 1
												}
												chai.request(node.url())
													.post('/req_timer_block')
													.send(data)
													.end((err, res) => {
														expect(res).to.have.status(200);
														expect(res).to.be.json;
														var body = res.body;
														expect(body).to.have.property('status').that.is.a('number');
														expect(body.status).to.equal(0);
														done()	
													})
													
											})
											var states = {
												"ON" : "OFF",
												"OFF" : "ON"
											}
											it(`STATE Should BE CHANGEd after period`, (done) => {
													
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

														var prevState = body.devices[device_id].state 
														setTimeout(function() {
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
																	
																	expect(body.devices[device_id].state ).to.equal(states[prevState]);
																	done();
																})
														}, 1600)
														
														
													})												
											}).timeout(6000)
											
											it(`DELETE that timer`, (done) => {
												setTimeout(function() {
													
													chai.request(node.url())
														.post('/req_timer_block')
														.send({
															timer_id: free_id,
															method: "DELETE"
														})
														.end((err, res) => {
															expect(res).to.have.status(200);
															expect(res).to.be.json;
															
															
															var body = res.body;
															expect(body).to.have.property('status').that.is.a('number');
															expect(body.status).to.equal(0);
															done();
														})
													
												}, 1000)														
											})
										}
									})
									done();
								});
						});
					})
					
					describe('/GET req_timer - exactly type', () => {
						it('it should GET all timers', (done) => {
							chai.request(node.url())
								.get('/req_timer')
								.end((err, res) => {
									expect(res).to.have.status(200);
									expect(res).to.be.json;

									var body = res.body;

									expect(body).to.have.property('status').that.is.a('number');
									expect(body.status).to.equal(0);
									expect(body).to.have.property('free_id').that.is.a('number');
									expect(body).to.have.property('timers').that.is.a('array');

									var free_id = body.free_id

									describe('/POST req_timer_block', () => {
										if (free_id < 0)
											it('it CAN NOT add more timer', (done) => {
												done()
											})
										else {
											it('add toggle event after 30 seconds', (done) => {
												var data = {
													command: "TOGGLE",
													days_in_week: "0,1,2,3,4,5,6",
													device_id: device_id,
													enabled: 1,
													end: 0,
													excute_at: time() + 30 + 7 * 60 * 60,
													init: false,
													method: "POST",
													name: "",
													start: 0,
													timer_id: free_id,
													timer_type: 2
												}
												chai.request(node.url())
													.post('/req_timer_block')
													.send(data)
													.end((err, res) => {
														expect(res).to.have.status(200);
														expect(res).to.be.json;
														var body = res.body;
														expect(body).to.have.property('status').that.is.a('number');
														expect(body.status).to.equal(0);
														done()	
													})
													
											})
											var states = {
												"ON" : "OFF",
												"OFF" : "ON"
											}
											it(`STATE Should BE CHANGEd after period`, (done) => {
													
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

														var prevState = body.devices[device_id].state 
														setTimeout(function() {
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
																	
																	expect(body.devices[device_id].state ).to.equal(states[prevState]);
																	done();
																})
																
														}, 30000)
														
														
													})												
											}).timeout(35000)
											
											it(`DELETE that timer`, (done) => {
												setTimeout(function() {
													
													chai.request(node.url())
														.post('/req_timer_block')
														.send({
															timer_id: free_id,
															method: "DELETE"
														})
														.end((err, res) => {
															expect(res).to.have.status(200);
															expect(res).to.be.json;
															
															
															var body = res.body;
															expect(body).to.have.property('status').that.is.a('number');
															expect(body.status).to.equal(0);
															done();
														})
													
												}, 1000)														
											})
										}
									})
									done();
								});
						});
					})
					
				}
			})
	})
    
});