figma.showUI(__html__, { width: 440, height: 600 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'create-thumbnails') {
        const sizes = msg.sizes;
        if (!sizes || sizes.length === 0) {
            figma.notify('No sizes provided to create thumbnails.');
            return;
        }
        
        const selection = figma.currentPage.selection;
        let originalNode;
        if (selection.length > 0) {
            originalNode = selection[0];
        } else {
            figma.notify('Please select a node to create thumbnails.');
            return;
        }

        let lastNode = originalNode;
        const createdNodes = [];

        for (const size of sizes) {
            const newNode = originalNode.clone();
            newNode.resize(Number(size.width), Number(size.height));
            newNode.name = size.name || `${size.width}x${size.height}`;
            
            newNode.x = lastNode.x + lastNode.width + 40; // 40px spacing
            newNode.y = originalNode.y;
            
            figma.currentPage.appendChild(newNode);
            createdNodes.push(newNode);
            lastNode = newNode;
        }

        figma.currentPage.selection = [originalNode, ...createdNodes];

        figma.notify('Thumbnails created successfully!');
    } else if (msg.type === 'save-sizes') {
        const { groupName, sizes } = msg;

        const presets = await figma.clientStorage.getAsync('thumbnailPresets') || [];
        presets.push({ name: groupName, sizes });
        await figma.clientStorage.setAsync('thumbnailPresets', presets);

        figma.notify('Sizes saved successfully!');
    } else if (msg.type === 'load-presets') {
        const presets = await figma.clientStorage.getAsync('thumbnailPresets') || [];
        figma.ui.postMessage({ type: 'load-presets', presets });
    } else if (msg.type === 'show-notification') {
        figma.notify(msg.message);
    }
};

figma.on("selectionchange", () => {
    const selection = figma.currentPage.selection;
    figma.ui.postMessage({
        type: "selectionChanged",
        selectionCount: selection.length
    });
});