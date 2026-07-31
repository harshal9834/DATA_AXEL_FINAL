const fs = require('fs');
let content = fs.readFileSync('frontend/src/routes/app.agents.tsx', 'utf8');
content = content.replace('      socket.off("workflow_log_added");\n      socket.disconnect();\n      unsubscribe();\n    };\n  }, []);', '    return () => {\n      socket.off("workflow_log_added");\n      socket.disconnect();\n      unsubscribe();\n    };\n  }, []);');
fs.writeFileSync('frontend/src/routes/app.agents.tsx', content);
