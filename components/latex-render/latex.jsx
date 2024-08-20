'use client'
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function LatexRenderer() {
    const [numPages, setNumPages] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const fetchPdf = async () => {
            const response = await fetch('http://127.0.0.1:8000');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            setPdfUrl(url);
        }
        fetchPdf();
    }, []);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className="w-full h-full">
            <h1>Latex Renderer</h1>
            {pdfUrl && (
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    {Array.from(
                        new Array(numPages),
                        (el, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                            />
                        ),
                    )}
                </Document>
            )}
        </div>
    );
};
