'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tree } from 'react-arborist';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import Tex from '@/public/tex.tsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/constants';
import { tx } from '@instantdb/react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileTreeNode = ({ node, style, dragHandle }) => {
    const [nodeStyle, setNodeStyle] = useState({ base: style });
    const onMouseOver = () => {
        if (node.data.hover) {
            setNodeStyle(() => ({
                base: { ...style, ...{ backgroundColor: "hsl(var(--muted))" } }
            }));
        }
    };

    const onMouseLeave = () => {
        if (node.data.hover) {
            setNodeStyle(() => ({ base: style }));
        }
    };

    const handleToggleClick = (e) => {
        e.stopPropagation();
        node.toggle();
        node.tree.props.onToggle({ id: node.id, isExpanded: !node.data.isExpanded });
    };

    const handleRename = () => {
        // Implement rename logic here
    };

    const handleDelete = () => {
        node.tree.props.onDelete({ ids: [node.id], type: node.data.type });
    };

    const handleAddFile = () => {
        // Implement add file logic here
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div 
                    className={cn(
                        "flex items-center gap-2 p-1 rounded-md cursor-pointer",
                        node.isSelected && "bg-accent",
                    )}
                    style={nodeStyle.base} 
                    ref={dragHandle}
                    onMouseOver={onMouseOver}
                    onMouseLeave={onMouseLeave}
                    onClick={!node.isLeaf ? handleToggleClick : undefined}
                >
                    <div className="flex items-center justify-between w-full p-1 rounded-md text-foreground">
                        <div className="flex items-center gap-2">
                            {node.isLeaf ? (
                                node.data.name.endsWith('.tex') ? (
                                    <Tex />
                                ) : (
                                    <File className="w-4 h-4" />
                                )
                            ) : node.data.isExpanded ? (
                                <FolderOpen className="w-4 h-4" />
                            ) : (
                                <Folder className="w-4 h-4" />
                            )}
                            <span className="text-sm">{node.data.name}</span>
                        </div>
                        {!node.isLeaf && (
                            <div className="focus:outline-none">
                                {node.data.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleRename}>
                    <Edit className="w-4 h-4 mr-2" />
                    Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </ContextMenuItem>
                {!node.isLeaf && (
                    <ContextMenuItem onClick={handleAddFile}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add File
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
};

const FileTree = ({ projectId }) => {
    const { data: filesData, error, isLoading} = db.useQuery({
        files: {
            $: {
                where: {
                    projectId: projectId
                }
            }
        }
    });

    const transformedData = useMemo(() => {
        if (!filesData?.files) return [];

        const buildTree = (parentId = null) => {
            return filesData.files
                .filter(file => file.parent_id === parentId)
                .map(file => ({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    hover: true,
                    isExpanded: file.isExpanded ?? false,
                    ...(file.type === 'folder' && {
                        children: buildTree(file.id)
                    })
                }));
        };

        return buildTree();
    }, [filesData]);

    const initialOpenState = useMemo(() => {
        if (!filesData?.files) return {};
        
        return filesData.files.reduce((acc, file) => {
            acc[file.id] = file.isExpanded ?? false;
            return acc;
        }, {});
    }, [filesData]);

    const treeContainerRef = useRef(null);
    const [treeContainer, setTreeContainer] = useState({
        width: 256,
        height: 735
    });

    // const handleCreate = ({ parentId, index, type }) => {
    //     setData(prevData => {
    //         const newNode = {
    //             id: Date.now().toString(),
    //             name: type === 'file' ? 'New File' : 'New Folder',
    //             children: type === 'folder' ? [] : undefined,
    //             hover: true
    //         };
    //         const updatedData = JSON.parse(JSON.stringify(prevData));
    //         const parent = findNodeById(updatedData, parentId);
    //         if (parent) {
    //             parent.children.splice(index, 0, newNode);
    //         } else {
    //             updatedData.splice(index, 0, newNode);
    //         }
    //         return updatedData;
    //     });
    // };

    // const handleRename = ({ id, name }) => {
    //     setData(prevData => {
    //         const updatedData = JSON.parse(JSON.stringify(prevData));
    //         const node = findNodeById(updatedData, id);
    //         if (node) {
    //             node.name = name;
    //         }
    //         return updatedData;
    //     });
    // };

    const handleMove = ({ dragIds, parentId, index }) => {
        const updates = dragIds.map(id => ({
            id: id,
            parent_id: parentId
        }));

        // Get all files with the same parent_id
        const siblingFiles = filesData.files.filter(file => file.parent_id === parentId);

        // Insert the moved files at the specified index
        const updatedSiblings = [
            ...siblingFiles.slice(0, index),
            ...updates,
            ...siblingFiles.slice(index)
        ];

        // Update the order of all affected files
        const orderUpdates = updatedSiblings.map((file, i) => ({
            id: file.id,
            order: i
        }));

        // Combine all updates
        const allUpdates = [...updates, ...orderUpdates];

        // Perform the database transaction
        db.transact(
            allUpdates.map(update => 
                tx.files[update.id].update(update)
            )
        );
    };

    const handleDelete = ({ ids, type }) => {
        if(type === 'file') {
            db.transact([
                tx.files[ids[0]].delete()
            ]);
        } else if (type === 'folder') {
            // Recursive function to collect all child files and folders
            const collectChildren = (folderId) => {
                return filesData.files.filter(file => file.parent_id === folderId).flatMap(child => {
                    if (child.type === 'folder') {
                        return [child.id, ...collectChildren(child.id)];
                    }
                    return child.id;
                });
            };

            const childrenIds = collectChildren(ids[0]);

            // Delete the folder and all its children
            db.transact([
                ...childrenIds.map(id => tx.files[id].delete()),
                tx.files[ids[0]].delete()
            ]);
        }
    };

    const handleToggle = ({ id, isExpanded }) => {
        console.log(isExpanded);
        db.transact([
            tx.files[id].update({ isExpanded: isExpanded })
        ]);
    };

    // const findNodeById = (nodes, id) => {
    //     for (let node of nodes) {
    //         if (node.id === id) return node;
    //         if (node.children) {
    //             const found = findNodeById(node.children, id);
    //             if (found) return found;
    //         }
    //     }
    //     return null;
    // };

    // const removeNodeById = (nodes, id) => {
    //     for (let i = 0; i < nodes.length; i++) {
    //         if (nodes[i].id === id) {
    //             nodes.splice(i, 1);
    //             return true;
    //         }
    //         if (nodes[i].children && removeNodeById(nodes[i].children, id)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // };

  
    useEffect(() => {
        console.log("Effect running");

        const resizeObserver = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setTreeContainer({
                width: width - 32,
                height: height 
            });
        });

        const observeElement = () => {
            if (treeContainerRef.current) {
                resizeObserver.observe(treeContainerRef.current);
            } else {
                setTimeout(observeElement, 100); 
            }
        };

        observeElement();

        return () => {
            console.log("Cleanup: disconnecting ResizeObserver");
            resizeObserver.disconnect();
        };
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div ref={treeContainerRef} className="flex flex-col grow h-full shadow-sm w-full">
            <div className="flex items-center justify-between  px-4 border-b py-2">
                <div className="text-sm font-medium">Files</div>
                <div className="flex items-center">
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <ScrollArea className="flex-grow w-full px-4 py-2">
                <Tree
                    data={transformedData}
                    onMove={handleMove}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    className="text-foreground"
                    width={treeContainer.width}
                    height={treeContainer.height}
                    rowHeight={36}
                    initialOpenState={initialOpenState}
                >
                    {FileTreeNode}
                </Tree>
            </ScrollArea>
        </div>
    );
};

export default FileTree;
