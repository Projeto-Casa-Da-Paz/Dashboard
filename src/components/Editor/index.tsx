import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';
import Quill from 'quill';

const Block = Quill.import('blots/block');

class AlignedBlock extends Block {
    static create(value: string) {
        const node = super.create();
        node.style.textAlign = value; // Aplica o alinhamento ao nó
        return node;
    }

    static formats(node: HTMLElement) {
        return node.style.textAlign; // Retorna o formato de alinhamento
    }
}

// Registre o novo blot
AlignedBlock.blotName = 'alignedBlock'; // Nome do blot
AlignedBlock.tagName = 'div'; // Tag HTML correspondente

Quill.register(AlignedBlock);

export const Editor = () => {
    const [content, setContent] = useState<string>('');

    const handleChange = (value: string) => {
        setContent(value);
    };

    return (
        <div>
            <ReactQuill
                value={content}
                onChange={handleChange}
                modules={{
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link', 'image'],
                        [{ 'align': [] }], // Adicione este botão
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        ['clean']
                    ],
                }}
                formats={['header', 'bold', 'italic', 'underline', 'link', 'image', 'align', 'color', 'background', 'font']}
            />
            <div style={{ marginTop: '20px' }}>
                <h3>Conteúdo do Editor:</h3>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export default Editor;
