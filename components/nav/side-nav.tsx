'use client'
import FileTree from '@/components/file-tree/file-tree'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'
import Profile from '@/components/profile/profile'
import LoadingSideNav from '@/components/nav/loading-side-nav'
import { useFrontend } from '@/contexts/FrontendContext'
import { useProject } from '@/contexts/ProjectContext'

export default function SideNav() {
    const { project, projectIsLoading, projectId } = useProject();
    const projectTitle = project?.title;

    if (projectIsLoading) {
        return <LoadingSideNav />;
    }

    return (
        <div className="w-full h-full flex flex-col  bg-muted/25">
            <div className="p-4 flex items-center justify-between">
                <Link href="/projects" className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                            {projectTitle ? projectTitle.split(' ').map((word: string) => word[0]).join('') : ''}
                        </span>
                    </div>
                    <span className="text-sm text-medium text-foreground">{projectTitle}</span>
                </Link>
                <ModeToggle />
            </div>

            <div className="p-4 flex space-x-2">
                <Input placeholder="Search files..." className="flex-grow" />
                <Button>
                    <Search className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-grow overflow-auto">
                <FileTree projectId={projectId} />
            </div>

            <div className="mt-auto">
                <Profile />
            </div>
        </div>
    );
};
