// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// This file is part of ThingEngine
//
// Copyright 2019 The Board of Trustees of the Leland Stanford Junior University
//
// Author: Giovanni Campagna <gcampagn@cs.stanford.edu>
//
// See COPYING for details
"use strict";

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Tp = require('thingpedia');

const manifests = fs.readFileSync(path.resolve(path.dirname(module.filename), 'collection.tt'))
    .toString('utf8').split('====');

const Builtins = require('../../../lib/devices/builtins');

class TestSubdevice extends Tp.BaseDevice {
    constructor(engine, state, master) {
        super(engine, state);

        this.uniqueId = 'org.thingpedia.builtin.test.subdevice-' + state.id;
        this.name = `Test Subdevice ${state.id}`;
        this.description = `This is another Test, a Device, and also a Subdevice of ${master.uniqueId}`;
    }

    do_frobnicate({ param }) {
        assert.strictEqual(param, 'frob');
        console.log('frob');
    }
}

class TestCollectionDevice extends Tp.BaseDevice {
    constructor(engine, state) {
        super(engine, state);

        this.name = "Test Collection Device";
        this.description = "This is a Test, a Device, and also a Collection";
        this.uniqueId = 'org.thingpedia.builtin.test.collection-1';

        this._collection = new Tp.ObjectSet.Simple();
    }

    addOne(suffix) {
        this._collection.addOne(new TestSubdevice(this.engine, { kind: 'org.thingpedia.builtin.test.subdevice', id: suffix }, this));
    }

    removeOne(suffix) {
        this._collection.removeById('org.thingpedia.builtin.test.subdevice-' + suffix);
    }

    queryInterface(iface) {
        if (iface === 'subdevices')
            return this._collection;
        else
            return super.queryInterface(iface);
    }
}
TestCollectionDevice.subdevices = {
    'org.thingpedia.builtin.test.subdevice': TestSubdevice
};

// inject builtins
Builtins['org.thingpedia.builtin.test.collection'] = {
    class: manifests[0],
    module: TestCollectionDevice
};
Builtins['org.thingpedia.builtin.test.subdevice'] = {
    class: manifests[1],
    module: TestSubdevice
};
