import styles from '@styles/components/Markdown.module.scss'
import React, { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import gfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'

function Markdown(props: { text: string; style?: any; className?: any }): JSX.Element {
    const { text, style, className } = props
    const id = uuidv4()
    useEffect(() => {
        const markdown = document.getElementById(id)
        if (markdown) {
            const links = markdown.getElementsByTagName('a')
            for (let i = 0; i < links.length; i += 1) {
                links[i].setAttribute('target', '_blank')
                links[i].setAttribute('rel', 'noopener noreferrer')
            }
        }
    }, [])
    return (
        <div className={`${styles.markdown} ${className}`} id={id} style={style}>
            <ReactMarkdown rehypePlugins={[gfm, rehypeRaw]}>{text}</ReactMarkdown>
        </div>
    )
}

Markdown.defaultProps = {
    style: null,
    className: '',
}

export default Markdown
