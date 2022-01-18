import React, { useContext, useEffect } from 'react'
import { AccountContext } from '@contexts/AccountContext'
import { SpaceContext } from '@contexts/SpaceContext'
import styles from '@styles/components/SpacePageAbout.module.scss'
import Column from '@components/Column'
import Row from '@components/Row'

const SpacePageGovernance = ({
    match,
}: {
    match: { params: { spaceHandle: string } }
}): JSX.Element => {
    const { params } = match
    const { spaceHandle } = params
    const { accountDataLoading } = useContext(AccountContext)
    const { spaceData, getSpaceData, setSelectedSpaceSubPage } = useContext(SpaceContext)
    const { handle } = spaceData

    useEffect(() => {
        setSelectedSpaceSubPage('governance')
        if (!accountDataLoading && spaceHandle !== handle) {
            getSpaceData(spaceHandle, false)
        }
    }, [accountDataLoading, spaceHandle])

    return (
        <Column className={styles.wrapper}>
            <Column className={styles.content}>
                <h2>Still to be developed...</h2>
                <p>
                    This section will contain polls and customisable governance modules to help the
                    community self govern.
                </p>
                <br />
                <p>Estimate start date: Unknown</p>
            </Column>
        </Column>
    )
}

export default SpacePageGovernance
