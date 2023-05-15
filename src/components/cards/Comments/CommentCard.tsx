import CloseOnClickOutside from '@components/CloseOnClickOutside'
import Column from '@components/Column'
import FlagImage from '@components/FlagImage'
import Row from '@components/Row'
import ShowMoreLess from '@components/ShowMoreLess'
import EditCommentModal from '@components/cards/Comments/EditCommentModal'
import DraftText from '@components/draft-js/DraftText'
import DeleteCommentModal from '@components/modals/DeleteCommentModal'
import { AccountContext } from '@contexts/AccountContext'
import { dateCreated, timeSinceCreated } from '@src/Helpers'
import styles from '@styles/components/cards/Comments/CommentCard.module.scss'
import {
    DeleteIcon,
    EditIcon,
    LikeIcon,
    LinkIcon,
    ReplyIcon,
    StarIcon,
    VerticalEllipsisIcon,
} from '@svgs/all'
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

function CommentCard(props: {
    comment: any
    highlighted: boolean
    toggleReplyInput: () => void
    removeComment: (comment: any) => void
    editComment: (comment: any, newText: string) => void
}): JSX.Element {
    const { comment, highlighted, toggleReplyInput, removeComment, editComment } = props
    const { text, state, accountLike, accountRating, accountLink, createdAt, updatedAt, Creator } =
        comment
    const { loggedIn, accountData } = useContext(AccountContext)
    const [menuOpen, setMenuOpen] = useState(false)
    const [editCommentModalOpen, setEditCommentModalOpen] = useState(false)
    const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false)
    const [likeModalOpen, setLikeModalOpen] = useState(false)
    const [ratingModalOpen, setRatingModalOpen] = useState(false)
    const [linkModalOpen, setLinkModalOpen] = useState(false)
    const isOwnComment = Creator.id === accountData.id

    return (
        <Column
            id={`comment-${comment.id}`}
            className={`${styles.wrapper} ${highlighted && styles.highlighted}`}
        >
            <Row>
                <Link
                    to={`/u/${Creator.handle}`}
                    style={{ pointerEvents: Creator.handle ? 'auto' : 'none' }}
                >
                    <FlagImage type='user' size={30} imagePath={Creator.flagImagePath} />
                </Link>
                <Column className={styles.content}>
                    {isOwnComment && (
                        <>
                            <button
                                type='button'
                                className={styles.menuButton}
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <VerticalEllipsisIcon />
                            </button>
                            {menuOpen && (
                                <CloseOnClickOutside onClick={() => setMenuOpen(false)}>
                                    <Column className={styles.menu}>
                                        <Column>
                                            <button
                                                type='button'
                                                onClick={() => setEditCommentModalOpen(true)}
                                            >
                                                <EditIcon />
                                                Edit text
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => setDeleteCommentModalOpen(true)}
                                            >
                                                <DeleteIcon />
                                                Delete post
                                            </button>
                                        </Column>
                                    </Column>
                                </CloseOnClickOutside>
                            )}
                        </>
                    )}
                    <Row style={{ marginBottom: 2 }}>
                        {state === 'account-deleted' ? (
                            <p className='grey' style={{ marginRight: 5 }}>
                                [Account deleted]
                            </p>
                        ) : (
                            <Link to={`/u/${Creator.handle}`} style={{ marginRight: 5 }}>
                                <p style={{ fontWeight: 600 }}>{Creator.name}</p>
                            </Link>
                        )}
                        <p className='grey' title={dateCreated(createdAt)}>
                            {`• ${timeSinceCreated(createdAt)}`}
                        </p>
                        {createdAt !== updatedAt && (
                            <p
                                className='grey'
                                title={`Edited at ${dateCreated(updatedAt)}`}
                                style={{ paddingLeft: 5 }}
                            >
                                *
                            </p>
                        )}
                    </Row>
                    {state !== 'account-deleted' && (
                        <ShowMoreLess height={250} gradientColor='grey'>
                            <DraftText
                                stringifiedDraft={state === 'deleted' ? '[comment deleted]' : text}
                                markdownStyles={`${styles.markdown} ${
                                    state === 'deleted' && styles.deleted
                                }`}
                            />
                        </ShowMoreLess>
                    )}
                </Column>
            </Row>
            {loggedIn && state === 'visible' && (
                <Row className={styles.buttons}>
                    <button
                        type='button'
                        className={styles.reply}
                        onClick={() => toggleReplyInput()}
                    >
                        <ReplyIcon />
                    </button>
                    <button
                        type='button'
                        className={accountLike && styles.blue}
                        onClick={() => setLikeModalOpen(true)}
                    >
                        <LikeIcon />
                        <p>0</p>
                    </button>
                    <button
                        type='button'
                        className={accountRating && styles.blue}
                        onClick={() => setRatingModalOpen(true)}
                    >
                        <StarIcon />
                        <p>0</p>
                    </button>
                    <button
                        type='button'
                        className={accountLink && styles.blue}
                        onClick={() => setLinkModalOpen(true)}
                    >
                        <LinkIcon />
                        <p>0</p>
                    </button>
                </Row>
            )}
            {/* {likeModalOpen && (
                <LikeModal
                    postData={postData}
                    setPostData={setPostData}
                    close={() => setLikeModalOpen(false)}
                />
            )}
            {ratingModalOpen && (
                <RatingModal
                    postData={postData}
                    setPostData={setPostData}
                    close={() => setRatingModalOpen(false)}
                />
            )}
            {linkModalOpen && (
                <LinkModal
                    type='post'
                    location={location}
                    postData={postData}
                    setPostData={setPostData}
                    close={() => setLinkModalOpen(false)}
                />
            )} */}
            {editCommentModalOpen && (
                <EditCommentModal
                    comment={comment}
                    editComment={editComment}
                    close={() => setEditCommentModalOpen(false)}
                />
            )}
            {deleteCommentModalOpen && (
                <DeleteCommentModal
                    comment={comment}
                    removeComment={removeComment}
                    close={() => setDeleteCommentModalOpen(false)}
                />
            )}
        </Column>
    )
}

export default CommentCard
