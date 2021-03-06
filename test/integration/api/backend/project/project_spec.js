'use strict';
var chakram = require('chakram'),
    expect = chakram.expect,
    Request = require('../../commons/request.js'),
    request = new Request(),
    User = require('../user/user.js'),
    user = new User(),
    Project = require('./project.js'),
    project = new Project(),
    ObjectID = require('mongodb').ObjectID,
    config = require('../../../../config/config.json');

describe('Project test', function() {

//GET /  get project published

    it('Get project published - all params', function() {
        return request.getBackend('/project?count=*&page=0&query=%7B%22hardwareTags%22:%7B%22$all%22:%5B%22us%22%5D%7D%7D',200).then(function(response) {
            expect(response).not.have.to.json([]);
            return chakram.wait();
        });
    });

    it.skip('Get project published - without params', function() {
        return request.getBackend('/project',400).then(function() {
            return chakram.wait();
        });
    });

    it.skip('Get project published - invalid params', function() {
        return request.getBackend('/project?p=0',400).then(function() {
            return request.getBackend('/project?cont=*',400).then(function() {
                return request.getBackend('/project?qery=%7B%22hardwareTags%22:%7B%22$all%22:%5B%22us%22%5D%7D%7D',400).then(function() {
                    return chakram.wait();
                });
            });
        });
    });

    it('Get project published - one params', function() {
        return request.getBackend('/project?page=1',200).then(function(response1) {
            expect(response1).not.have.to.json([]);
            return request.getBackend('/project?count=*',200).then(function(response2) {
                expect(response2).have.to.json('count', function(number) {
                    expect(number).to.be.at.least(0);
                });
                return request.getBackend('/project?query=%7B%22hardwareTags%22:%7B%22$all%22:%5B%22us%22%5D%7D%7D',200).then(function(response3) {
                    expect(response3).not.have.to.json([]);
                    return chakram.wait();
                });
            });
        });
    });

//GET /project/me

    it('Get projects of a user', function() {
        var userRandom = user.generateRandomUser();
        return request.postBackend('/user',200,userRandom).then(function(response) {
            var project1 = project.generateProjectRandom();
            var project2 = project.generateProjectRandom();
            return request.postBackend('/project',200,project1,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                return request.postBackend('/project',200,project2,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                    return request.getBackend('/project/me?page=0&pageSize=1',200,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response2) {
                        expect(response2).have.to.json(function(json) {
                            expect(json.length).to.be.equal(1);
                        });
                        return request.getBackend('/project/me?pageSize=5',200,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response3) {
                            expect(response3).have.to.json(function(json) {
                                expect(json.length).to.be.equal(2);
                            });
                            return chakram.wait();
                        });
                    });
                });
            });
        });
    });

    it.skip('Get projects of a user - without mandatory params', function() {
        var userRandom = user.generateRandomUser();
        return request.postBackend('/user',200,userRandom).then(function(response) {
            return request.getBackend('/project/me?page=0',400,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                return request.getBackend('/project/me',400,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                    return chakram.wait();
                });
            });
        });
    });

    it('Get projects of a user - token is incorrect', function() {
        var token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        return request.getBackend('/project/me',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
            return request.getBackend('/project/me?page=0',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                return request.getBackend('/project/me?pageSize=1',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                    return request.getBackend('/project/me?page=0&pageSize=1',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                        return chakram.wait();
                    });
                });
            });
        });
    });

//GET /project/shared

    it('Get shared projects of a user', function() {
        return request.postBackend('/auth/local',200,config.adminLogin).then(function(response) {
            return request.getBackend('/project/shared?pageSize=1',200,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response2) {
                expect(response2).have.to.json(function(json) {
                    expect(json.length).to.be.equal(1);
                });
                return request.getBackend('/project/shared?page=0&pageSize=3',200,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response3) {
                    expect(response3).have.to.json(function(json) {
                        expect(json.length).to.be.equal(3);
                    });
                });
            });
        });
    });

    it('Get shared projects of a user - token is incorrect', function() {
        var token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        return request.getBackend('/project/shared',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
            return request.getBackend('/project/shared?page=0',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                return request.getBackend('/project/shared?pageSize=1',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                    return request.getBackend('/project/shared?page=0&pageSize=1',401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                        return chakram.wait();
                    });
                });
            });
        });
    });

    it.skip('Get projects of a user - without mandatory params', function() {
        return request.postBackend('/auth/local',200,config.adminLogin).then(function(response) {
            return request.getBackend('/project/shared?page=0',400,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                return request.getBackend('/project/shared',400,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                    return chakram.wait();
                });
            });
        });
    });

//GET /project/:id

    it('Get a project', function() {
        var userRandom = user.generateRandomUser();
        return request.postBackend('/user',200,userRandom).then(function(response) {
            var project1 = project.generateProjectRandom();
            return request.postBackend('/project',200,project1,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response2) {
                return request.getBackend('/project/'+response2.body,200,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response3) {
                    expect(response3).not.have.to.json({});
                    chakram.wait();
                });
            });
        });
    });

    it('Get a project - the project no exist', function() {
        var idRandom = new ObjectID();
        var userRandom = user.generateRandomUser();
        return request.postBackend('/user',200,userRandom).then(function(response) {
            return request.getBackend('/project/'+idRandom,404,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function() {
                    chakram.wait();
            });
        });
    });

    it('Get a project - invalid token', function() {
        var token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        var userRandom = user.generateRandomUser();
        return request.postBackend('/user',200,userRandom).then(function(response) {
            var project1 = project.generateProjectRandom();
            return request.postBackend('/project',200,project1,{headers:{'Authorization':'Bearer '+response.body.token}}).then(function(response2) {
                return request.getBackend('/project/'+response2.body,401,{headers:{'Authorization':'Bearer '+token}}).then(function() {
                    chakram.wait();
                });
            });
        });
    });
});
