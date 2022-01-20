import React, { useContext, useEffect } from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'
import { SpaceContext } from '@contexts/SpaceContext'
import styles from '@styles/pages/SpacePage/SpacePage.module.scss'
import Column from '@components/Column'
import Row from '@components/Row'
import SpacePageSidebar from '@pages/SpacePage/SpacePageSidebar'
import CoverImage from '@components/CoverImage'
import PageTabs from '@components/PageTabs'
import SpacePageSettings from '@pages/SpacePage/SpacePageSettings'
import SpacePageAbout from '@pages/SpacePage/SpacePageAbout'
import SpacePagePosts from '@pages/SpacePage/SpacePagePosts'
import SpacePageSpaces from '@pages/SpacePage/SpacePageSpaces'
import SpacePagePeople from '@pages/SpacePage/SpacePagePeople'
import SpacePageCalendar from '@pages/SpacePage/SpacePageCalendar'
import SpacePageRooms from '@pages/SpacePage/SpacePageRooms'
import SpacePageGovernance from '@pages/SpacePage/SpacePageGovernance'
import { ReactComponent as SettingsIconSVG } from '@svgs/cog-solid.svg'
// import EmptyPage from './EmptyPage'

const SpacePage = ({ match }: { match: { url: string } }): JSX.Element => {
    const { url } = match
    const { spaceData, resetSpaceData, isModerator } = useContext(SpaceContext)
    const location = useLocation()
    const subpage = location.pathname.split('/')[3]
    const tabs = {
        baseRoute: `/s/${spaceData.handle}`,
        left: [
            { text: 'About', visible: true, selected: subpage === 'about' },
            { text: 'Posts', visible: true, selected: subpage === 'posts' },
            { text: 'Spaces', visible: true, selected: subpage === 'spaces' },
            { text: 'People', visible: true, selected: subpage === 'people' },
            { text: 'Calendar', visible: true, selected: subpage === 'calendar' },
            { text: 'Rooms', visible: true, selected: subpage === 'rooms' },
            { text: 'Governance', visible: true, selected: subpage === 'governance' },
        ],
        right: [
            {
                text: 'Settings',
                visible: isModerator,
                selected: subpage === 'settings',
                icon: <SettingsIconSVG />,
            },
        ],
    }

    useEffect(() => () => resetSpaceData(), [])

    return (
        <Row className={styles.wrapper}>
            <SpacePageSidebar />
            <Column className={styles.content}>
                <CoverImage
                    coverImagePath={spaceData.coverImagePath}
                    imageUploadType='holon-cover-image'
                    canEdit={isModerator}
                />
                <PageTabs tabs={tabs} />
                <Column className={styles.centerPanel}>
                    <Switch>
                        <Redirect from={url} to={`${url}/posts`} exact />
                        <Route path='/s/:spaceHandle/about' component={SpacePageAbout} exact />
                        <Route path='/s/:spaceHandle/posts' component={SpacePagePosts} exact />
                        <Route path='/s/:spaceHandle/spaces' component={SpacePageSpaces} exact />
                        <Route path='/s/:spaceHandle/people' component={SpacePagePeople} exact />
                        <Route
                            path='/s/:spaceHandle/calendar'
                            component={SpacePageCalendar}
                            exact
                        />
                        <Route path='/s/:spaceHandle/rooms' component={SpacePageRooms} exact />
                        <Route
                            path='/s/:spaceHandle/governance'
                            component={SpacePageGovernance}
                            exact
                        />
                        <Route
                            path='/s/:spaceHandle/settings'
                            component={SpacePageSettings}
                            exact
                        />
                        {/* Todo: conditionally display private pages or auto redirect to public posts */}
                        {/* like on user notifications page: if (!isOwnAccount) history.push(`/u/${userData.handle}/about`) */}
                        {/* <Route component={ EmptyPage }/> TODO: Check if this needs to be doubled up on the App.js component */}
                    </Switch>
                </Column>
            </Column>
        </Row>
    )
}

export default SpacePage

/* <div className={`${styles.SpacePage} ${showAccountSideBar && styles.showAccountSideBar}`}>
    <CoverImage
        coverImagePath={spaceData.coverImagePath}
        imageUploadType='holon-cover-image'
        canEdit={isModerator}
    />
    <div className={`${styles.SpacePageContent} ${fullScreen && styles.fullScreen}`}>
        <SpacePageSideBarLeft />
        <div className={styles.SpacePageCenterPanel}>
            <Switch>
                <Redirect from={url} to={`${url}/posts`} exact />
                <Route
                    path='/s/:spaceHandle/settings'
                    component={SpacePageSettings}
                    exact
                />
                <Route path='/s/:spaceHandle/about' component={SpacePageAbout} exact />
                <Route path='/s/:spaceHandle/posts' component={SpacePagePosts} exact />
                <Route path='/s/:spaceHandle/spaces' component={SpacePageSpaces} exact />
                <Route path='/s/:spaceHandle/users' component={SpacePagePeople} exact />
                <Route component={ EmptyPage }/>
            </Switch>
        </div>
        {!(subpage === 'spaces' && spaceSpacesFilters.view === 'Map') && (
            <SpacePageSideBarRight />
        )}
    </div>
    <AccountSideBar />
</div> */
