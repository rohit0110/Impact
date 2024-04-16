// App.js

import React, { useState } from 'react';
import Graph from 'react-graph-vis';

const App = () => {
  // State variables
  const [graph, setGraph] = useState({
    nodes: [],
    edges: []
  });
  const graphOptions = {
    nodes: {
      color: {
        background: 'lightblue', // Default node color
        border: 'black',
        highlight: {
          border: 'black'
        }
      },
      font: {
        color: 'black'
      }
    },
    edges: {
      color: {
        color: 'black',
        highlight: 'blue' // Highlight color for edges
      }
    }
  };
  const [nodeName, setNodeName] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodeShape, setSelectedNodeShape] = useState('ellipse'); // Default shape

  // Add a new node
  const addNode = () => {
    console.log(graph);
    const newNodeId = graph.nodes.length + 1;
    const newNode = { id: newNodeId, label: nodeName, shape: selectedNodeShape };
    setGraph({
      ...graph,
      nodes: [...graph.nodes, newNode]
    });
    setNodeName('');
  };

  // Add a new edge
  const addEdge = () => {
    // Find node IDs based on labels
    const sourceNode = graph.nodes.find(node => node.label === edgeSource);
    const targetNode = graph.nodes.find(node => node.label === edgeTarget);
  
    // Ensure both source and target nodes are found
    if (sourceNode && targetNode) {
      const newEdge = { from: sourceNode.id, to: targetNode.id };
      setGraph({
        ...graph,
        edges: [...graph.edges, newEdge]
      });
    } else {
      console.error('Source or target node not found!');
    }
  
    setEdgeSource('');
    setEdgeTarget('');
  };

  // Handle node click
  const handleNodeClick = (event) => {
    const { nodes } = event;
    if (nodes.length === 1) {
      setSelectedNodeId(nodes[0]);
    } else {
      console.log("works");
      setSelectedNodeId(null);
    }
  };

  const handleBackgroundClick = (event) => {
    console.log("Works");
    if (!event.nodes.length) {
      setSelectedNodeId(null); // Clear the selected node ID only if no node is clicked
    }
  };

  // Function to calculate dependent nodes and edges
  const getDependents = (selectedNodeId, graph) => {
    let dependentNodes = [];
    let dependentEdges = [];
  
    const visitedNodes = new Set(); // To keep track of visited nodes
    const visitedEdges = new Set();
  
    const findDependents = (nodeId) => {
      if (visitedNodes.has(nodeId)) return; // Skip if the node has already been visited
      visitedNodes.add(nodeId); // Mark the current node as visited
  
      // Find edges with the given node as the source
      const outEdges = graph.edges.filter(edge => edge.from === nodeId);
      outEdges.forEach(edge => {
        // Find the target node of the edge
        const targetNode = graph.nodes.find(node => node.id === edge.to);
        if (targetNode) {
          // Add the target node and edge to the dependent lists
          if (!(visitedEdges.has(edge))) {
            dependentEdges.push(edge);
            visitedEdges.add(edge);
          }
          if (visitedNodes.has(targetNode.id)) return;
          dependentNodes.push(targetNode);
          // Recursively find dependents of the target node
          findDependents(targetNode.id);
        }
      });
    };
  
    // Start recursive search from the selected node
    findDependents(selectedNodeId);
  
    return { dependentNodes, dependentEdges };
  };

  // Get selected node information
  const selectedNode = graph.nodes.find(node => node.id === selectedNodeId);

  // Get dependent nodes and edges
  const { dependentNodes, dependentEdges } = getDependents(selectedNodeId, graph);

  // Generate the graph data with dynamic styling for dependent nodes
  const graphData = {
    nodes: graph.nodes.map(node => ({
      ...node,
      color: dependentNodes.some(depNode => depNode.id === node.id) ? 'red' : 'lightblue' // Highlight dependent nodes in red
    })),
    edges: graph.edges.map(edge => ({
      ...edge,
      color: dependentEdges.some(depEdge => depEdge.from === edge.from && depEdge.to === edge.to) ? 'red' : 'black' // Highlight dependent edges in red
    }))
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Node Name"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
        />
        <button onClick={addNode}>Add Node</button>
        <select value={selectedNodeShape} onChange={(e) => setSelectedNodeShape(e.target.value)}>
          <option value="ellipse">Ellipse</option>
          <option value="circle">Circle</option>
          <option value="box">Box</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div>
        <input
          type="text"
          placeholder="Edge Source"
          value={edgeSource}
          onChange={(e) => setEdgeSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="Edge Target"
          value={edgeTarget}
          onChange={(e) => setEdgeTarget(e.target.value)}
        />
        <button onClick={addEdge}>Add Edge</button>
      </div>
      <div style={{ display: 'flex' }}>
      <div style={{ flex: '1 1 50%', marginRight: '20px' }}>
        <Graph
          graph={graphData}
          options={graphOptions} // You can provide options for the graph visualization here
          events={{ selectNode: handleNodeClick, click: handleBackgroundClick }}
          style={{ width: '100%', height: '600px' }} // Set the size of the canvas
        />
      </div>
      <div style={{ flex: '1 1 50%' }}>
        {selectedNode && (
          <div>
            <h3>Selected Node Information</h3>
            <NodeInfo node={graph.nodes.find(node => node.id === selectedNodeId)} shape={selectedNodeShape} />
            <DependentNodes nodes={dependentNodes} />
            <DependentEdges edges={dependentEdges} />
          </div>
        )}
      </div>
    </div>
  </div>
);
};

// Component to display selected node information
const NodeInfo = ({ node, shape }) => (
  <div>
    <p>ID: {node.id}</p>
    <p>Label: {node.label}</p>
    <p>Shape: {shape}</p>
  </div>
);

// Component to display dependent nodes
const DependentNodes = ({ nodes }) => (
  <div>
    <h4>Dependent Nodes:</h4>
    <ul>
      {nodes.map(node => (
        <li key={node.id}>{node.label}</li>
      ))}
    </ul>
  </div>
);

// Component to display dependent edges
const DependentEdges = ({ edges }) => (
  <div>
    <h4>Dependent Edges:</h4>
    <ul>
      {edges.map(edge => (
        <li key={`${edge.from}-${edge.to}`}>{`${edge.from} -> ${edge.to}`}</li>
      ))}
    </ul>
  </div>
);


export default App;