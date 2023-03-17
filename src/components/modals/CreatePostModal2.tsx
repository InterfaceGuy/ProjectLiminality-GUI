/* eslint-disable no-nested-ternary */
// import InquiryAnswer from '@components/cards/InquiryAnswer'
// import PostCard from '@components/cards/PostCard/PostCard'
// import StringBeadCard from '@components/cards/PostCard/StringBeadCard'
// import CheckBox from '@components/CheckBox'
import Button from '@components/Button'
import Column from '@components/Column'
import DraftTextEditor from '@components/draft-js/DraftTextEditor'
import ImageTitle from '@components/ImageTitle'
import Images from '@src/components/cards/PostCard/PostTypes/Images'
// import Markdown from '@components/Markdown'
import Audio from '@components/cards/PostCard/PostTypes/Audio'
import Modal from '@components/modals/Modal'
import PostSpaces from '@src/components/cards/PostCard/PostSpaces'
// import ProgressBarSteps from '@components/ProgressBarSteps'
import Row from '@components/Row'
// import Scrollbars from '@components/Scrollbars'
import SuccessMessage from '@components/SuccessMessage'
// import Toggle from '@components/Toggle'
import { AccountContext } from '@contexts/AccountContext'
import { SpaceContext } from '@contexts/SpaceContext'
import UrlPreview from '@src/components/cards/PostCard/UrlPreview'
// import GlassBeadGameTopics from '@src/GlassBeadGameTopics'
import {
    audioMBLimit,
    defaultErrorState,
    findDraftLength,
    findEventDuration,
    findEventTimes,
    formatTimeMMSS,
} from '@src/Helpers'
import colors from '@styles/Colors.module.scss'
import styles from '@styles/components/modals/CreatePostModal2.module.scss'
import * as d3 from 'd3'
// import flatpickr from 'flatpickr'
import AddPostImagesModal from '@components/modals/AddPostImagesModal'
import AddPostSpacesModal from '@components/modals/AddPostSpacesModal'
import config from '@src/Config'
import axios from 'axios'
import 'flatpickr/dist/themes/material_green.css'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Cookies from 'universal-cookie'
// import { v4 as uuidv4 } from 'uuid'
import { AudioIcon, CalendarIcon, CastaliaIcon, ClockIcon, ImageIcon, InquiryIcon } from '@svgs/all'

const { white, red, orange, yellow, green, blue, purple } = colors
const beadColors = [white, red, orange, yellow, green, blue, purple]
const defaultSelectedSpace = {
    id: 1,
    handle: 'all',
    name: 'All',
    flagImagePath: 'https://weco-prod-space-flag-images.s3.eu-west-1.amazonaws.com/1614556880362',
}

const CreatePostModal = (): JSX.Element => {
    const {
        accountData,
        setCreatePostModalOpen,
        createPostModalSettings,
        setCreatePostModalSettings,
        setAlertModalOpen,
        setAlertMessage,
    } = useContext(AccountContext)
    const { spaceData, spacePosts, setSpacePosts } = useContext(SpaceContext)
    const [loading, setLoading] = useState(false)
    const [postType, setPostType] = useState('')
    const [spaces, setSpaces] = useState<any[]>([spaceData.id ? spaceData : defaultSelectedSpace])
    const [title, setTitle] = useState('')
    const [text, setText] = useState({
        ...defaultErrorState,
        value: '',
        validate: (v) => {
            const errors: string[] = []
            const totalCharacters = findDraftLength(v)
            if (totalCharacters < 1) errors.push('Required')
            if (totalCharacters > 5000) errors.push('Must be less than 5K characters')
            return errors
        },
    })
    const [mentions, setMentions] = useState<any[]>([])
    const [urls, setUrls] = useState<any[]>([])
    const [urlsMetaData, setUrlsMetaData] = useState<any[]>([])
    const [images, setImages] = useState<any[]>([])
    // events
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [saved, setSaved] = useState(false)
    const [spacesModalOpen, setSpacesModalOpen] = useState(false)
    const [imagesModalOpen, setImagesModalOpen] = useState(false)
    const [audioModalOpen, setAudioModalOpen] = useState(false)
    const cookies = new Cookies()
    const urlRequestIndex = useRef(0)

    function closeModal() {
        setCreatePostModalOpen(false)
        setCreatePostModalSettings({ type: 'text' })
    }

    function scrapeUrlMetaData(url) {
        setUrlsMetaData((us) => [...us, { url, loading: true }])
        axios.get(`${config.apiURL}/scrape-url?url=${url}`).then((res) => {
            setUrlsMetaData((us) => {
                const newUrlsMetaData = [...us.filter((u) => u.url !== url)]
                newUrlsMetaData.push({ url, loading: false, ...res.data })
                return newUrlsMetaData
            })
        })
    }

    function removeUrlMetaData(url) {
        setUrlsMetaData((us) => [...us.filter((u) => u.url !== url)])
    }

    // audio
    const [audioFile, setAudioFile] = useState<File | undefined>()
    const [recording, setRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [sizeError, setSizeError] = useState(false)
    const [noAudioError, setNoAudioError] = useState(false)
    const audioRecorder = useRef<any>(null)
    const audioChunks = useRef<any>([])
    const recordingInterval = useRef<any>(null)

    function resetAudioState() {
        setAudioFile(undefined)
        setNoAudioError(false)
        setRecordingTime(0)
        audioChunks.current = []
        const input = d3.select('#audio-file-input').node()
        if (input) input.value = ''
    }

    function selectAudioFile() {
        const input = d3.select('#audio-file-input').node()
        if (input && input.files && input.files[0]) {
            if (input.files[0].size > audioMBLimit * 1024 * 1024) {
                setSizeError(true)
                resetAudioState()
            } else {
                setSizeError(false)
                setNoAudioError(false)
                setAudioFile(input.files[0])
            }
        }
    }

    function toggleAudioRecording() {
        if (recording) {
            audioRecorder.current.stop()
            setRecording(false)
        } else {
            resetAudioState()
            navigator.mediaDevices.getUserMedia({ audio: true }).then((audioStream) => {
                audioRecorder.current = new MediaRecorder(audioStream)
                audioRecorder.current.ondataavailable = (e) => {
                    audioChunks.current.push(e.data)
                }
                audioRecorder.current.onstart = () => {
                    recordingInterval.current = setInterval(() => {
                        setRecordingTime((t) => t + 1)
                    }, 1000)
                }
                audioRecorder.current.onstop = () => {
                    clearInterval(recordingInterval.current)
                    const blob = new Blob(audioChunks.current, { type: 'audio/mpeg-3' })
                    setAudioFile(new File([blob], ''))
                }
                audioRecorder.current.start()
                setRecording(true)
            })
        }
    }

    function createPost() {
        console.log('create post!')
        setSaved(true)
        setTimeout(() => closeModal(), 1000)
    }

    useEffect(() => {
        console.log('first useeffect')
    }, [])

    // grab metadata for new urls when added to text
    useEffect(() => {
        if (urlsMetaData.length <= 5) {
            // requestIndex used to pause requests until user has finished updating the url
            urlRequestIndex.current += 1
            const requestIndex = urlRequestIndex.current
            setTimeout(() => {
                if (urlRequestIndex.current === requestIndex) {
                    urls.forEach(
                        (url) => !urlsMetaData.find((u) => u.url === url) && scrapeUrlMetaData(url)
                    )
                }
            }, 500)
        }
    }, [urls])

    return (
        <Modal className={styles.wrapper} close={closeModal} centered confirmClose={!saved}>
            {saved ? (
                <SuccessMessage text='Post created!' />
            ) : (
                <Column centerX style={{ width: '100%' }}>
                    <h1>New post</h1>
                    <Column className={styles.postCard}>
                        <Row centerY className={styles.header}>
                            <ImageTitle
                                type='user'
                                imagePath={accountData.flagImagePath}
                                imageSize={32}
                                title={accountData.name}
                                style={{ marginRight: 5 }}
                                shadow
                            />
                            <PostSpaces spaces={spaces} preview />
                            <p className='grey'>now</p>
                            <button
                                className={styles.addSpacesButton}
                                type='button'
                                title='Click to add spaces'
                                onClick={() => setSpacesModalOpen(true)}
                            >
                                + Spaces
                            </button>
                        </Row>
                        <Column className={styles.content}>
                            {/* {['event', 'glass-bead-game'].includes(postType) && ( */}
                            <input
                                className={styles.title}
                                placeholder='Title...'
                                type='text'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {/* )} */}
                            <DraftTextEditor
                                type='post'
                                stringifiedDraft={text.value}
                                maxChars={5000}
                                state={text.state}
                                errors={text.errors}
                                onChange={(value, textMentions, textUrls) => {
                                    setText({ ...text, value, state: 'default' })
                                    setMentions(textMentions)
                                    setUrls(textUrls)
                                }}
                            />
                            {postType === 'image' && <Images images={images} />}
                            {postType === 'audio' && audioFile && (
                                <Audio
                                    key={audioFile.lastModified}
                                    id={0}
                                    url={URL.createObjectURL(audioFile)}
                                    location='create-post-audio'
                                />
                            )}
                            {postType === 'event' && (
                                <Row centerY className={styles.dates}>
                                    <ClockIcon />
                                    {startTime ? (
                                        <Row>
                                            <p>{findEventTimes(startTime, endTime)}</p>
                                            <p>{findEventDuration(startTime, endTime)}</p>
                                        </Row>
                                    ) : (
                                        <button
                                            className={styles.addDateButton}
                                            type='button'
                                            title='Click to add dates'
                                            onClick={() => setSpacesModalOpen(true)}
                                        >
                                            Add dates...
                                        </button>
                                    )}
                                </Row>
                            )}
                            {urlsMetaData.map((u) => (
                                <UrlPreview
                                    key={u.url}
                                    urlData={u}
                                    loading={u.loading}
                                    removeUrl={removeUrlMetaData}
                                    style={{ marginTop: 10 }}
                                />
                            ))}
                        </Column>
                    </Column>
                    <Column className={styles.contentOptions}>
                        {postType === 'audio' && (
                            <Column>
                                <Row centerY style={{ marginBottom: 20 }}>
                                    <Row className={styles.fileUploadInput}>
                                        <label htmlFor='audio-file-input'>
                                            Upload audio
                                            <input
                                                type='file'
                                                id='audio-file-input'
                                                accept='.mp3'
                                                onChange={selectAudioFile}
                                                hidden
                                            />
                                        </label>
                                    </Row>
                                    <Button
                                        text={recording ? 'Stop recording' : 'Record audio'}
                                        color='red'
                                        onClick={toggleAudioRecording}
                                    />
                                    {recording && (
                                        <h2 style={{ marginLeft: 10 }}>
                                            {formatTimeMMSS(recordingTime)}
                                        </h2>
                                    )}
                                </Row>
                                {(sizeError || noAudioError) && (
                                    <Column className={styles.errors}>
                                        {sizeError && (
                                            <p>Audio file too large. Max size: {audioMBLimit}MB</p>
                                        )}
                                        {noAudioError && <p>Recording or upload required</p>}
                                    </Column>
                                )}
                            </Column>
                        )}
                    </Column>
                    <Row className={styles.contentButtons}>
                        <button
                            className={postType === 'image' ? styles.selected : ''}
                            type='button'
                            title='Add images'
                            onClick={() => setImagesModalOpen(true)}
                        >
                            <ImageIcon />
                        </button>
                        <button
                            className={postType === 'audio' ? styles.selected : ''}
                            type='button'
                            title='Add audio'
                            onClick={() => setPostType('audio')}
                        >
                            <AudioIcon />
                        </button>
                        <button
                            className={postType === 'event' ? styles.selected : ''}
                            type='button'
                            title='Add event'
                            onClick={() => setPostType('event')}
                        >
                            <CalendarIcon />
                        </button>
                        <button type='button' title='Add poll' onClick={() => null}>
                            <InquiryIcon />
                        </button>
                        <button type='button' title='Add glass bead game' onClick={() => null}>
                            <CastaliaIcon />
                        </button>
                    </Row>
                    <Button text='Create post' color='blue' onClick={createPost} />
                </Column>
            )}
            {spacesModalOpen && (
                <AddPostSpacesModal
                    spaces={spaces}
                    setSpaces={setSpaces}
                    close={() => setSpacesModalOpen(false)}
                />
            )}
            {imagesModalOpen && (
                <AddPostImagesModal
                    images={images}
                    setImages={setImages}
                    setPostType={setPostType}
                    close={() => setImagesModalOpen(false)}
                />
            )}
        </Modal>
    )
}

export default CreatePostModal
