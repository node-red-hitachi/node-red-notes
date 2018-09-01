/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    var CSS = String.raw`
<style type="text/css">
.xbutton {
    border-radius: 15px;
    width: 100%;
    height: 100%;
    margin: 0px;
}
</style>
`;
    var HTML = String.raw`
<md-button class="md-raised xbutton"
           ng-click="buttonClick()"
           ng-style="{'background-color':'#84180F', 'color':'white', 'z-index':1, 'padding':'0px'}"
           >
    <span>OK?</span>
</md-button>
`;

    var ui = undefined;
    var installed = null;
    function XButtonNode(config) {
        var node = this;
        if(ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
            installed = ui.addWidget({
                format: CSS,
                templateScope: "global"
            });
        }
        RED.nodes.createNode(this, config);
        var done = ui.addWidget({
            node: node,
            format: HTML,
            templateScope: "local",
            group: config.group,
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            convertBack: function (value) {
                return value;
            },
            // needs beforeSend to message contents to be sent back to runtime 
            beforeSend: function (msg, original) {
                if (original) { return original.msg; }
            },
            initController: function($scope, events) {
                $scope.buttonClick = function () {
                    $scope.send({payload: new Date()});
                };
            }
        });
        node.on("close", done);
    }
    
    RED.nodes.registerType('ui_xbutton', XButtonNode);
};
