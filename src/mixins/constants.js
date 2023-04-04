export const pivotalData = {
    endpoints: {
        projects: {
            all: {
                path: '/projects',
                desc: 'Get projects'
            },
            byId: {
                path: '/projects/{projectId}'
            }
        },
        my: {
            activity: {
                path: '/my/activity',
                desc: 'User profile info + projects user has access to',
                params: {
                    limit: 'number',
                    offset: 'number',
                    occurred_after: 'datetime',
                    occurred_before: 'datetime',
                    sort_order: 'string'
                }
            },
            notifications: {
                path: '/my/notifications',
                desc: 'Users notifications'
            },
            ticketsInPR: {
                path: `/projects/{projectId}/search?query=${JSON.stringify('owner:af epic:"dev (pr + docs)"')}`
            }
        },
        search: {
            all: {
                path: '/projects/{projectId}/search'
            }
        },
        story: {
            activity: {
                path: '/projects/{projectId}/stories/{storyId}/activity',
                desc: 'Get activity for this story'
            }
        },
        epic: {
            activity: '/projects/{projectId}/epics/{epicId}/activity'
        }
    }
};

export const logTypes = [
    'mounted',
    'checkoutBoth',
    'readFromDb',
    'writeToDb',
    'getPivotal',
    'getPivotalEndpoint',
    'readFromDir',
    'loadNotes',
    'updateLogTypes'
];