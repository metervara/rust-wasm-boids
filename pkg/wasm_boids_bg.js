import * as wasm from './wasm_boids_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
/**
*/
export class Boid {

    static __wrap(ptr) {
        const obj = Object.create(Boid.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_boid_free(ptr);
    }
    /**
    * @returns {number}
    */
    get_x() {
        var ret = wasm.boid_get_x(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get_y() {
        var ret = wasm.boid_get_y(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get_angle() {
        var ret = wasm.boid_get_angle(this.ptr);
        return ret;
    }
}
/**
*/
export class Flock {

    static __wrap(ptr) {
        const obj = Object.create(Flock.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_flock_free(ptr);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} count
    * @param {number} radius
    * @param {number} max_speed
    * @param {number} max_force
    * @param {number} desired_separation
    * @param {number} neighbor_distance
    * @returns {Flock}
    */
    static new(width, height, count, radius, max_speed, max_force, desired_separation, neighbor_distance) {
        var ret = wasm.flock_new(width, height, count, radius, max_speed, max_force, desired_separation, neighbor_distance);
        return Flock.__wrap(ret);
    }
    /**
    * @returns {Array<any>}
    */
    boid_array() {
        var ret = wasm.flock_boid_array(this.ptr);
        return takeObject(ret);
    }
    /**
    */
    tick() {
        wasm.flock_tick(this.ptr);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    set_size(width, height) {
        wasm.flock_set_size(this.ptr, width, height);
    }
    /**
    */
    flock() {
        wasm.flock_flock(this.ptr);
    }
    /**
    */
    update() {
        wasm.flock_update(this.ptr);
    }
    /**
    */
    wrap_around() {
        wasm.flock_wrap_around(this.ptr);
    }
}

export const __wbg_boid_new = function(arg0) {
    var ret = Boid.__wrap(arg0);
    return addHeapObject(ret);
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_new_1abc33d4f9ba3e80 = function() {
    var ret = new Array();
    return addHeapObject(ret);
};

export const __wbg_push_44968dcdf4cfbb43 = function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export const __wbg_cos_f478f20c5512be25 = typeof Math.cos == 'function' ? Math.cos : notDefined('Math.cos');

export const __wbg_random_eb1fab8e1db2d9d1 = typeof Math.random == 'function' ? Math.random : notDefined('Math.random');

export const __wbg_sin_c226789c5813e9c2 = typeof Math.sin == 'function' ? Math.sin : notDefined('Math.sin');

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

