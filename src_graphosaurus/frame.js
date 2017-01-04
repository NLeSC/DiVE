module.exports = (function () {
    "use strict";	
    var THREE = require("three"),
       TrackballControls = require("three.trackball");
       //BufferGeometrySorter = require("three-buffergeometry-sort");
   
    var Frame = function (elem, graph, frameStartsAt) {
        this.frameStartsAt = frameStartsAt;
        if (typeof elem === 'string') {
            elem = document.getElementById(elem);
        }
        if (graph._nodes.length < 2) {
            throw "A graph needs at least two nodes";
        }
        //do not change this constant by any means. It defines the node image. This allows you to run the application completely offline, without having to install an http server
        this.discImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gMNDyATS0xXswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEzklEQVRYw7VXS08bZxQ9ngfGHoNrMg6uMU2omzQUgypYWBZCRq2ya9Vu2CAqVJVFV/kBbPgBbPgBRIoQKGWXX1AlhJeQQK6EXGweMSHEJib4NYYxnkcXvYMmrhsDMVe6sjQz8jn33u/e71wLrm9MlWfaVf/Ecg1A5hIEtMsS4i4JbDhncgYAS9/oBKZUeM3McJcEbgDQCMAKwA7ARs7SewVAGcAZgBIAiX5lExHtKiUwR2wHIPT19XlHRkaCDx48+Nbn83WKotim67pFluVyIpHYj0ajr16+fBmdn5+PAjghLwAoEhHN5B8lYIA3ArCHQqG2sbGxh6FQ6KfW1tb7PM/beJ63NjY2cgCgaZouy7JSKpXK+Xxe2tjY2JqZmfnz2bNnGwBSAI4B5ACcUja0j5XEiNoB4POhoaHvFhYW5k5OTo5lWT7Xa5iqqrokSefRaDQ5Pj7+B4BfAYQB3AMgUlBcLXA7gNZHjx79EI/HFyVJKuhXNEVRtIODg/zjx48XAfwO4CGRaKHzdNFBbEU5eADC8PBw5+jo6G9dXV3f22w225UHBMNYHA6HVRTFWwzDWFdWVtJ0KA1Xje5hK+seDofbhoeHfx4cHPzlOuAX0VgscDgcvMfjcW9tbZ3u7+8b50A2nwWmoiVt3d3dXwWDwR8FQXDgE41lWYvf728eGRkJAvgCgAeAk8rwb7LMLRcOh92hUCjk8/m+Rp1MEAS2v7/f19/fHyACn9E84SrHaqPH42m9e/duT0NDQ0O9CDAMg5aWFmswGPySCLRQl3FGBgwCvMvlcnu93nuos9ntdqanp+c2AFe1DFyMW4fD4fJ6ve31JiAIAhMIBJwAmgE00Rj/TwY4VVWt9Uy/uQw0Oe0UPW+MgA+uVE3TGNyQ6bpuIVDePA0/AMxms6epVOp9vcGLxaK+u7tb9UJiTA+Uo6OjQiKReHsTBCKRiATg3DQJ9coMKKlUKhOPx1/dAAFtbW0tRzqhSCQU8yRUAJQ2NzffvXjx4q/Dw8NsnaM/W1paSgLI0NVcNIQKY1IriqIo0urq6tbz588j9SJwfHysPn36NJXL5Y4ApImEoQ3AUi0u2jGTybCyLHMdHR0d7e3tzk8BT6fT2uzs7MmTJ09ipVJpB8A2gNcAsiTfVLayZTVNYw8ODsrlcpnv7e31O51O63VTv7CwUJyYmIil0+ltAHEAOwCSdBbKZgI66QEdgK4oCmKx2GkymdREURTv3LnTdNXIp6enM5OTkzt7e3sxAo9XRm/WA2b5rAHQy+WyGovF8tvb27IkSVZRFJtcLhdfK+rFxcWzqamp5Nzc3O7e3t7fBBwDsE9nwKi/Wk2UmmWZC0AbwzAdXq/3m0Ag0DkwMHA/EAi4u7q6mvx+v9UA3dzclCORyNn6+np+eXn53Zs3b1K5XO41gASl/TUJ1EKFQv5fVWyQcAK4DcDLcVy72+3ucDqdnubm5hZBEJo0TeNVVbXk8/nzQqEgZTKZbDabTQM4AnBI/hbA+2rgtfYCjpRLE2VDJL9FxBx0sbCU0jPq8QwBpmk3MKTY+WX3gsr9wNiKbERGIHAbXSzGOC8RkETRSkTq/GP7QK3ltNpe2GASFGaNrxBY2SQ8ay4il92OmQr5xlRZMLQqt51Wa0P+B2VKXoQbgAy9AAAAAElFTkSuQmCC";
        this.graph = graph;
        var width = elem.scrollWidth;
        var height = elem.scrollHeight;
        var aspectRatio = width / height;
        this._initScene();
        this._initRenderer(width, height, elem);
        this._initNodes(graph.getNodes(), graph.sizeAttenuation, graph.nodeSize);
        //this._normalizeNodes();
        this._initEdges(graph.getEdges());
        this._initCamera(aspectRatio);
        this._initControls(elem);
        this.positionCamera(true);
        this._initMouseEvents(elem, this.frameStartsAt);//changed by sonja
        this._animate();
    };

    Frame.prototype._initScene = function () {
        this.scene = new THREE.Scene();
    };

    Frame.prototype._initCamera = function (aspect) {
        var self = this;
        var viewAngle = this.graph._fov;
        var camera = new THREE.PerspectiveCamera(viewAngle, aspect);
        this.camera = camera;
        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            // TODO this should be the element width/height, not the window
            self.renderer.setSize(window.innerWidth, window.innerHeight);
            self.forceRerender();
        }, false);
    };

    Frame.prototype._getCamera = function () {
        return this.camera;
    };

    Frame.prototype._initRenderer = function (width, height, elem) {
        var renderer = new THREE.WebGLRenderer({
            antialias: this.graph._antialias,
            alpha: true,
        });
        renderer.setClearColor(this.graph._bgColor, this.graph._bgOpacity);
        renderer.setSize(width, height);
        elem.appendChild(renderer.domElement);
        this.renderer = renderer;
    };

    Frame.prototype.forceRerender = function () {
        this.renderer.render(this.scene, this.camera);
    };

    //added by sonja
    Frame.prototype.reDrawMe = function (sameScene, _sizeAttenuation, node_size, zoom_in) {      
        this._initNodes(this.graph.getNodes(), _sizeAttenuation, node_size);
        this._initEdges(this.graph.getEdges());
        if (!sameScene) {
            this.positionCamera(zoom_in);
        }
        this.forceRerender();
    };

   
    Frame.prototype._initControls = function (elem) {

        var self = this;
        var controls = new TrackballControls(this.camera, elem);
        controls.changeEvent = { type: 'change' };
        controls.startEvent = { type: 'start' };
        controls.endEvent = { type: 'end' };
        controls.points = this.points;
        controls.rotateSpeed = this.camera.near;//0.03;
        controls.panSpeed = this.camera.near;//0.1;
        controls.noZoom = true;
        controls.frameStartsAt = this.frameStartsAt;
        controls.mousewheel = function (event) {//zooms in to mouse position, like in gmaps
            var _this = controls;
            if (_this.enabled === false) { return; }
            event.preventDefault();
            event.stopPropagation();
            
            //by sonja
            var delta = ((typeof event.wheelDelta !== "undefined") ? (-event.wheelDelta) : event.detail);
            var d = delta;
            d = -0.01 * ((d > 0) ? 1 : -1);//the old one
            // = -this.camera.near * ((d > 0) ? 1 : -1);
            var factor = d;
            var mX = ((event.clientX - controls.frameStartsAt) / (window.innerWidth - controls.frameStartsAt)) * 2 - 1;
            var mY = -(event.clientY / window.innerHeight) * 2 + 1;
            var vector = new THREE.Vector3(mX, mY, 0.5);
            vector.unproject(controls.object);
            vector.sub(controls.object.position);
            controls.object.position.addVectors(controls.object.position, vector.setLength(factor));
            controls.target.addVectors(controls.target, vector.setLength(factor));
            controls.dispatchEvent(controls.startEvent);
            controls.dispatchEvent(controls.endEvent);

            //end by sonja

        };
        elem.addEventListener('mousewheel', controls.mousewheel, false);
        elem.addEventListener('DOMMouseScroll', controls.mousewheel, false); // firefox
        controls.addEventListener('change', function () {
            self.forceRerender();
        });
     
        this.controls = controls;
    };

    //changed by sonja
    Frame.prototype.positionCamera = function (zoom_in) {
        // Calculate optimal camera position
        this.points.computeBoundingSphere();
        var sphere = this.points.boundingSphere;
        var factor;
        var optimalDistance;
        var radians = this.graph._fov * Math.PI / 180;
        if (zoom_in) {
            factor = 0.8;// * Math.tan(this.graph._fov / 2);
            optimalDistance = Math.max(sphere.max_y_radius * factor / Math.tan(radians / 2), sphere.max_z_radius * factor / Math.tan(radians / 2), sphere.max_x_radius * factor);
        }
        else {
            factor = 1.3;
            optimalDistance = (sphere.radius * factor / Math.tan(this.graph._fov / 2));
        }
        
        //var optimalDistance = Math.max(sphere.max_y_radius * factor / Math.tan(radians / 2), sphere.max_z_radius * factor / Math.tan(radians / 2), sphere.max_x_radius * factor);
        //var optimalDistance = (sphere.max_y_radius * factor / Math.tan(this.graph._fov / 2));
        this.camera.position.x = sphere.center.x + optimalDistance;
        this.camera.position.y = sphere.center.y;
        this.camera.position.z = sphere.center.z;
        this.controls.target = sphere.center.clone();
    };

    // changed by sonja
    Frame.prototype._initNodes = function (nodes, _sizeAttenuation, _nodeSize) {
        var self = this;
        var material = new THREE.PointCloudMaterial({
            size: _nodeSize,
            vertexColors: true,
            sizeAttenuation: _sizeAttenuation,
            depthWrite: false,
        });
        if (true) {
            var texture = THREE.ImageUtils.loadTexture(
                this.discImageBase64,
            {},
            function () { self.forceRerender(); /* async call after texture is loaded */ });
            material.map = texture;
        }
        var positions = new THREE.BufferAttribute(
            new Float32Array(nodes.length * 3), 3);
        var colors = new THREE.BufferAttribute(
            new Float32Array(nodes.length * 3), 3);
        //ids added by Sonja
        var ids = new THREE.BufferAttribute( //added by sonja to be able to detect properly clicked nodes. previously it was detecting completely different nodes
            new Int32Array(nodes.length * 1), 1);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var pos = node._pos;
            var color = node._color;
            positions.setXYZ(i, pos.x, pos.y, pos.z);
            colors.setXYZ(i, color.r, color.g, color.b);
            ids.setX(i, i);
        }
        this.points = new THREE.BufferGeometry();
        this.points.computeBoundingSphere = function () {
            var max_x = -1;
            var max_z = -1;
            var max_y = -1;
            var vector = new THREE.Vector3();
            return function () {
                if (this.boundingSphere === null) {
                    this.boundingSphere = new THREE.Sphere();
                }
                var positions = this.attributes.position.array;
                if (positions) {
                    var centerOfGravity = new THREE.Vector3();
                    var count = 0;
                    for (var i = 0, il = positions.length; i < il; i += 3) {
                        vector.set(positions[i], positions[i + 1], positions[i + 2]);
                        centerOfGravity.add(vector);
                        count += 1;
                        if (positions[i] > max_x) { max_x = positions[i]; }
                        if (positions[i + 1] > max_y) { max_y = positions[i + 1]; }
                        if (positions[i + 2] > max_z) { max_z = positions[i + 2]; }
                    }
                    centerOfGravity.divideScalar(count);
                    this.boundingSphere.center = centerOfGravity;
                    var maxRadiusSq = 0;
                    for (var ii = 0, ili = positions.length; ii < ili; ii += 3) {
                        vector.set(positions[ii], positions[ii + 1], positions[ii + 2]);
                        maxRadiusSq = Math.max(maxRadiusSq, centerOfGravity.distanceToSquared(vector));
                    }
                    this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
                    this.boundingSphere.max_x_radius = Math.abs(max_x - centerOfGravity.x);
                    this.boundingSphere.max_y_radius = Math.abs(max_y - centerOfGravity.y);
                    this.boundingSphere.max_z_radius = Math.abs(max_z - centerOfGravity.z);
                    if (isNaN(this.boundingSphere.radius)) {
                        this.boundingSphere.radius = 1.5;
                        THREE.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values. Radius2 is' + maxRadiusSq);
                    }
                }
            };
        }();
        //end by sonja



        this.points.addAttribute('position', positions);
        this.points.addAttribute('color', colors);
        this.points.addAttribute('id', ids);    
        this.scene.remove(this.pointCloud);
        //
        THREE.PointCloud = function (geometry, material) {

            THREE.Object3D.call(this);

            this.type = 'PointCloud';

            this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
            this.material = material !== undefined ? material : new THREE.PointCloudMaterial({ color: Math.random() * 0xffffff });

        };

        THREE.PointCloud.prototype = Object.create(THREE.Object3D.prototype);
        THREE.PointCloud.prototype.constructor = THREE.PointCloud;

        THREE.PointCloud.prototype.raycast = (function () {

            var inverseMatrix = new THREE.Matrix4();
            var ray = new THREE.Ray();

            return function (raycaster, intersects) {

                var object = this;
                var geometry = object.geometry;
                var threshold = raycaster.params.PointCloud.threshold;

                inverseMatrix.getInverse(this.matrixWorld);
                ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

                if (geometry.boundingBox !== null) {

                    if (ray.isIntersectionBox(geometry.boundingBox) === false) {

                        return;

                    }

                }

                var localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
                var position = new THREE.Vector3();

                var testPoint = function (point, index) {

                    var rayPointDistance = ray.distanceToPoint(point);

                    if (rayPointDistance < localThreshold) {

                        var intersectPoint = ray.closestPointToPoint(point);
                        intersectPoint.applyMatrix4(object.matrixWorld);

                        //var distance = raycaster.ray.origin.distanceTo(intersectPoint);

                        intersects.push({



                            distance: Math.sqrt(rayPointDistance),//distance,

                            distanceToRay: Math.sqrt(rayPointDistance),

                            point: intersectPoint.clone(),

                            index: index,

                            face: null,

                            object: object



                        });

                    }

                };

                if (geometry instanceof THREE.BufferGeometry) {

                    var attributes = geometry.attributes;
                    var positions = attributes.position.array;

                    if (attributes.index !== undefined) {

                        var indices = attributes.index.array;
                        var offsets = geometry.offsets;

                        if (offsets.length === 0) {

                            var offset = {
                                start: 0,
                                count: indices.length,
                                index: 0
                            };

                            offsets = [offset];

                        }

                        for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

                            var start = offsets[oi].start;
                            var count = offsets[oi].count;
                            var index = offsets[oi].index;

                            for (var i = start, il = start + count; i < il; i++) {

                                var a = index + indices[i];

                                position.fromArray(positions, a * 3);

                                testPoint(position, a);

                            }

                        }

                    } else {

                        var pointCount = positions.length / 3;

                        for (var ii = 0; ii < pointCount; ii++) {

                            position.set(
                                positions[3 * ii],
                                positions[3 * ii + 1],
                                positions[3 * ii + 2]
                            );

                            testPoint(position, ii);

                        }

                    }

                } else {

                    var vertices = this.geometry.vertices;

                    for (var ij = 0; ij < vertices.length; ij++) {

                        testPoint(vertices[ij], ij);

                    }

                }

            };

        }());

        THREE.PointCloud.prototype.clone = function (object) {

            if (object === undefined) { object = new THREE.PointCloud(this.geometry, this.material); }

            THREE.Object3D.prototype.clone.call(this, object);

            return object;

        };

        //



        this.pointCloud = new THREE.PointCloud(this.points, material);

        if (this.graph._nodeImageTransparent === true) {
            material.transparent = true;
            this.pointCloud.sortParticles = true;
        }
        this.scene.add(this.pointCloud);
    };

    

    Frame.prototype._normalizeNodes = function () {
        this.points.computeBoundingSphere();
        this.scale = 1 / this.points.boundingSphere.radius;
        var positions = this.points.attributes.position.array;
        for (var i = 0; i < positions.length; i++) {
            positions[i] *= this.scale;
        }
    };

    Frame.prototype._initEdges = function (edges) {
        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            linewidth: this.graph._edgeWidth,
            opacity: this.graph._edgeOpacity,
            transparent: this.graph._edgeOpacity < 1,
        });
        this.scale = 1;
        var positions = new THREE.BufferAttribute(
            new Float32Array(edges.length * 6), 3);
        var colors = new THREE.BufferAttribute(
            new Float32Array(edges.length * 6), 3);

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var nodes = edge.getNodes();

            positions.setXYZ(
                2 * i,
                this.scale * nodes[0]._pos.x,
                this.scale * nodes[0]._pos.y,
                this.scale * nodes[0]._pos.z);

            positions.setXYZ(
                2 * i + 1,
                this.scale * nodes[1]._pos.x,
                this.scale * nodes[1]._pos.y,
                this.scale * nodes[1]._pos.z);

            colors.setXYZ(
                2 * i,
                edge._color.r,
                edge._color.g,
                edge._color.b);

            colors.setXYZ(
                2 * i + 1,
                edge._color.r,
                edge._color.g,
                edge._color.b);
        }

        this.edges = new THREE.BufferGeometry();
        this.edges.addAttribute('position', positions);
        this.edges.addAttribute('color', colors);
        this.scene.remove(this.line);
        this.line = new THREE.Line(this.edges, material, THREE.LinePieces);
        this.scene.add(this.line);
    };

    //changed by sonja
    Frame.prototype._initMouseEvents = function (elem, frameStartsAt) {
        var self = this;
        var createMouseHandler = function (callback) {
            var raycaster = new THREE.Raycaster();
            raycaster.params.PointCloud.threshold = 0.001;//was 1, changed by sonja
            raycaster.precision = 0.0000000001;
            raycaster.linePrecision = 1;        
            var mouse = new THREE.Vector2();
            return function (evt) {
                evt.preventDefault();
                mouse.x = ((evt.clientX - frameStartsAt) / (window.innerWidth - frameStartsAt)) * 2 - 1;
                mouse.y = 1 - (evt.clientY / window.innerHeight) * 2;
                raycaster.near = self.camera.near; //added by sonja
                raycaster.far = self.camera.far;//added by sonja
                raycaster.setFromCamera(mouse, self.camera);
                var intersects = raycaster.intersectObject(self.pointCloud, true);
                if (intersects.length) {
                    var firstIndex = intersects[0].index;
                    callback(self.graph._nodes[firstIndex]);
                }
            };
        };

        if (this.graph._hover) {
            elem.addEventListener(
                'mousemove', createMouseHandler(this.graph._hover), false);
        }

        if (this.graph._click) {
            elem.addEventListener(
                'click', createMouseHandler(this.graph._click), false);
        }
        if (this.graph._mousedown) {
            elem.addEventListener(
                'mousedown', createMouseHandler(this.graph._mousedown), false);
        }

    };

    //changed by sonja
    Frame.prototype._updateCameraBounds = (function () {
        var prevCameraPos;
        return function () {
            // TODO: this shouldn't update every frame
            // TODO: is this still even necessary now that we scale?
            var cameraPos = this.camera.position;

            if (cameraPos === prevCameraPos) { return; }

            var boundingSphere = this.points.boundingSphere;
            var distance = boundingSphere.distanceToPoint(cameraPos);

            if (distance > 0) {
                this.camera.near = distance;
                this.camera.far = distance + boundingSphere.radius * 2;
                this.camera.updateProjectionMatrix();
            }
            else {
                this.camera.near = 0.0001;//flexible
                this.camera.far = boundingSphere.radius * 2;
                this.camera.updateProjectionMatrix();
            }
            prevCameraPos = cameraPos.clone();
        };
    }());

    Frame.prototype._animate = function () {
        var self = this;//,
        //sorter = new BufferGeometrySorter(5);
        // Update near/far camera range
        (function animate() {
            self._updateCameraBounds();
            //sorter.sort(self.points.attributes, self.controls.object.position);      
            window.requestAnimationFrame(animate);
            self.controls.update();
        }());
    };

    

    return Frame;
}());
