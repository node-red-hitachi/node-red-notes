# Make Node-RED Dashboard widgets installable (outdated)

Currently, Node-RED Dashboard do not allow installing user created widget nodes.  Instead, it supports **TEMPLATE** node which allows embedding HTML code in its setting panel.   However, making new widget node installable is desirable because it enriches Node-RED Dashboard ecosystem as of current Node-RED nodes.

## How to make Node-RED Dashboard widges installable

- Basic node code (HTML and JavaScript) structure follows those of template node (but can be arbitrary),
- Support code generation from existing **TEMPLATE** node using nodegen tool (optional).




### Problems & Proposal

1. Widget node is basically same as ordinary Node-RED node.  Different point is that it requires accessing `ui.js` module of Node-RED Dashboard for accessing UI interfaces (e.g. `ui.add`).  Because `us.js` is stored under `node-red-dashboard` module, we need some means for accessing it.

   *Proposal:*

   1. Add interface (e.g. `getDashboardPath`) for getting module install path of `node-red-dashboard`. 
      - Can access other data stored under `node-red-dashboard` such as icons.
      - As pointed on the last teleconference, this interface is too specialized for Node-RED Dashboard.

   2. Add interface (e.g. getModulePath) for getting module installation path (or other information if there are good usage) of any module.
      - This proposal is generarization of #1.

   3. Add interface for accessing `ui.js` interface from node API (i.e. `RED` variable) passed on node initialization.
      - Similar to #1, this proposal is too specialized for Node-RED Dashboard.

   4. other better way for accessing `ui.js`?

      ​

   Currently, we prefer #2 because this one is more general compared to other proposal.

   ​

2. Accessing interfaces of `us.js`  must be delayed after `node-red-dashboard` is loaded.

   *Proposal*:

   - Delay `require` of `ui.js` until widget node deployment.



### Node Code Structure

- HTML code
  - Same as normal node described at  (https://nodered.org/docs/creating-nodes/node-html).  
- JavaScript code
  - load  `us.js` module using method of proposal#2,
  - call `us.add` function with parameters similar to **TEMPLATE** node.


### Excerpt from Generated Code by Prototype Implementation

- HTML code

  ```html
  <script type="text/x-red" data-template-name="ui_hello">
     ... help text ...
  </script>

  <script type="text/javascript">
      function mk_conf(NAME) {
         ... create node definition ...
      };

      RED.nodes.registerType('ui_hello', mk_conf('hello'));
  </script>
  ```

  ​

- JavaScript code

  ```javascript
  module.exports = function(RED) {

      var TEMPLATE_SCOPE = "local";
      // HTML code for widget
      var TEMPLATE = '// name: hello\n<div style=\"background-color:#84180F; color:#FFFFFF; border-radius:15px; font-size:20px;\" align=\"center\">\n    Hello Node-RED\n</div>\n';
      var STORE_OUT_MSGS = true;
      var FWD_IN_MSGS = true;

      var ui = undefined;
      
      function TemplateNode(config) {
          if(ui === undefined) {
              // load ui.js module
              var base = RED.nodes.getModulePath("node-red-dashboard");
              ui = require(base+'/ui')(RED);
          }
          RED.nodes.createNode(this, config);
          var node = this;
          var group = RED.nodes.getNode(config.group);
          if (!group && TEMPLATE_SCOPE !== 'global') { return; }
          var tab = null;
          if (TEMPLATE_SCOPE !== 'global') {
              tab = RED.nodes.getNode(group.config.tab);
              if (!tab) { return; }
              if (!config.width) {
                  config.width = group.config.width;
              }
          }
          var hei = Number(config.height || 0);
          // initialize UI widget
          var done = ui.add({
              forwardInputMessages: FWD_IN_MSGS,
              storeFrontEndInputAsState: STORE_OUT_MSGS,
              emitOnlyNewValues: false,
              node: node,
              tab: tab,
              group: group,
              control: {
                  type: 'template',
                  order: config.order,
                  width: config.width || 6,
                  height: hei,
                  format: TEMPLATE,
                  templateScope: TEMPLATE_SCOPE
              },
              ...
          });
          node.on("close", done);
      }
      RED.nodes.registerType('ui_hello', TemplateNode);
  };
  ```

  ​