'use client'
import React, { useState } from 'react';
import { Tree } from 'react-arborist';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import texSvg from '@/public/tex.svg';

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

    return (
        <div 
            className={cn(
                "flex items-center gap-2 p-1 rounded-md",
                node.isSelected && "bg-accent"
            )}
            style={nodeStyle.base} 
            ref={dragHandle}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center gap-2 p-2 rounded-md">
                {!node.isLeaf && (
                    <button onClick={() => node.toggle()} className="focus:outline-none">
                        {node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
                {node.isLeaf ? (
                    node.data.name.endsWith('.tex') ? (
                        <Image src={texSvg} alt="TeX file" width={20} height={20} />
                    ) : (
                        <File className="w-4 h-4" />
                    )
                ) : node.isOpen ? (
                    <FolderOpen className="w-4 h-4" />
                ) : (
                    <Folder className="w-4 h-4" />
                )}
                <span className="text-sm">{node.data.name}</span>
            </div>
        </div>
    );
};

const FileTree = ({ initialData }) => {
    const [data, setData] = useState([
        {
            id: '1',
            name: 'main.tex',
            hover: true
        },
        {
            id: '2',
            name: 'chapters',
            hover: true,
            children: [
                { id: '3', name: 'introduction.tex', hover: true },
                { id: '4', name: 'methodology.tex', hover: true },
                { id: '5', name: 'results.tex', hover: true },
                { id: '6', name: 'conclusion.tex', hover: true }
            ]
        },
        {
            id: '7',
            name: 'figures',
            hover: true,
            children: [
                { id: '8', name: 'figure1.png', hover: true },
                { id: '9', name: 'figure2.png', hover: true }
            ]
        },
        {
            id: '10',
            name: 'bibliography',
            hover: true,
            children: [
                { id: '11', name: 'references.bib', hover: true }
            ]
        },
        { id: '12', name: 'abstract.tex', hover: true },
        { id: '13', name: 'preamble.tex', hover: true }
    ]);
    
    const [cursor, setCursor] = useState(false);

    const handleCreate = ({ parentId, index, type }) => {
        setData(prevData => {
            const newNode = {
                id: Date.now().toString(),
                name: type === 'file' ? 'New File' : 'New Folder',
                children: type === 'folder' ? [] : undefined,
                hover: true
            };
            const updatedData = JSON.parse(JSON.stringify(prevData));
            const parent = findNodeById(updatedData, parentId);
            if (parent) {
                parent.children.splice(index, 0, newNode);
            } else {
                updatedData.splice(index, 0, newNode);
            }
            return updatedData;
        });
    };

    const handleRename = ({ id, name }) => {
        setData(prevData => {
            const updatedData = JSON.parse(JSON.stringify(prevData));
            const node = findNodeById(updatedData, id);
            if (node) {
                node.name = name;
            }
            return updatedData;
        });
    };

    const handleMove = ({ dragIds, parentId, index }) => {
        setData(prevData => {
            const updatedData = JSON.parse(JSON.stringify(prevData));
            const nodesToMove = dragIds.map(id => {
                const node = findNodeById(updatedData, id);
                removeNodeById(updatedData, id);
                return node;
            });
            const parent = parentId ? findNodeById(updatedData, parentId) : { children: updatedData };
            parent.children.splice(index, 0, ...nodesToMove);
            return updatedData;
        });
    };

    const handleDelete = ({ ids }) => {
        setData(prevData => {
            const updatedData = JSON.parse(JSON.stringify(prevData));
            ids.forEach(id => removeNodeById(updatedData, id));
            return updatedData;
        });
    };

    const handleToggle = ({ id, isOpen }) => {
        setData(prevData => {
            const updatedData = JSON.parse(JSON.stringify(prevData));
            const node = findNodeById(updatedData, id);
            if (node && node.children) {
                node.isOpen = isOpen;
                if (cursor) {
                    cursor.active = false;
                }
                node.active = true;
                setCursor(node);
            }
            return updatedData;
        });
    };

    const findNodeById = (nodes, id) => {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const removeNodeById = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                nodes.splice(i, 1);
                return true;
            }
            if (nodes[i].children && removeNodeById(nodes[i].children, id)) {
                return true;
            }
        }
        return false;
    };

    return (
        <div className="p-4 h-full shadow-sm w-full">
            <Tree
                data={data}
                onCreate={handleCreate}
                onRename={handleRename}
                onMove={handleMove}
                onDelete={handleDelete}
                onToggle={handleToggle}
                className="text-foreground"
                width={256}
                height={911}
                indent={24}
                rowHeight={36}
                overscanCount={1}
                padding={25}
            >
                {FileTreeNode}
            </Tree>
        </div>
    );
};

export default FileTree;
