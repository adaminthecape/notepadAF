import deepmerge from "deepmerge";
import { exec } from "child_process";

export function runCmd(
    command,
    onData,
    onError
)
{
    if(!(typeof command === 'string' && command.length))
    {
        console.warn('command wrong!', command, args);

        return;
    }

    const { exec } = require("child_process");

    exec(command, (error, stdout, stderr) => {
        if (error) {
            if(typeof onError === 'function')
            {
                onError(error);
            }
            else
            {
                console.error(error);
            }

            return error;
        }
        if (stderr) {
            if(typeof onError === 'function')
            {
                onError(stderr);
            }
            else
            {
                console.error(stderr);
            }

            return stderr;
        }

        if(typeof onData === 'function')
        {
            console.log(`result of "${command}":`, '\n', stdout);

            onData(stdout);
        }
        else
        {
            console.log(`result of "${command}":`, '\n', stdout);

            return stdout;
        }
    });
}

export default {
    name: 'GitMixin',
    data()
    {
        return {
            loadingTimeout: null,
            isLoadingGitStatus: false,
            gitRenderKey: 0,
            gitStatus: {},
            moduleBasePath: 'C:/devRepos/'
        };
    },
    inject: ['$log', '$notify'],
    methods: {
        runCmd,
        checkModule(module)
        {
            switch(module)
            {
                case 'aluminate-api':
                case 'aluminate-vue':
                case 'core-api':
                case 'framework':
                    return true;
                default:
                    return false;
            }
        },
        getGitStatusForAllModules()
        {
            this.$log(`getGitStatusForAllModules`);
            this.getGitStatus('aluminate-vue');
            this.getGitStatus('aluminate-api');
            this.getGitStatus('core-api');
            this.getGitStatus('localhost');
        },
        getGitStatus(module = 'aluminate-vue', thenFn)
        {
            this.$log('getGitStatus', module);
            this.setLoading(true);
            if(!this.checkModule(module))
            {
                return;
            }

            const branchRegex = /On branch (.*)\n/g;

            this.runCmd(
                `cd ${this.moduleBasePath}${module} && git status`,
                (res) =>
                {
                    if(res)
                    {
                        const data = {};

                        data.branch = branchRegex
                            .exec(res)[0]
                            .replace('\n', '')
                            .replace('On branch ', '');

                        if(
                            res.includes('nothing to commit, working tree clean') ||
                            res.includes('nothing added to commit but untracked files present')
                        )
                        {
                            data.safeToChange = true;
                        }

                        console.log({ data });

                        this.gitStatus[module] = data;

                        if(typeof thenFn === 'function')
                        {
                            thenFn(data);
                        }

                        this.gitRenderKey += 1;
                        this.setLoading(false);

                        return data;
                    }

                    return res;
                }
            );
        },
        setLoading(val)
        {
            if(this.isLoadingGitStatus === val)
            {
                return;
            }

            if(val)
            {
                this.isLoadingGitStatus = val;
            }
            else
            {
                if(this.loadingTimeout)
                {
                    clearTimeout(this.loadingTimeout);
                }

                this.loadingTimeout = setTimeout(() =>
                {
                    this.isLoadingGitStatus = val;
                }, 500);
            }
        },
        checkoutBoth(branchId)
        {
            this.$log('checkoutBoth', branchId);
            if(typeof branchId === 'number')
            {
                branchId = `PT_${branchId}`;
            }

            this.changeGitBranch('aluminate-vue', branchId);
            this.changeGitBranch('aluminate-api', branchId, () => this.getGitStatusForAllModules());
        },
        changeGitBranch(module, to, thenFn)
        {
            this.$log('checkoutBoth', `${module} :: ${to}`);
            console.log('changeGitBranch:', module, to);
            if(!to || !this.checkModule(module))
            {
                return;
            }

            this.getGitStatus(
                module,
                (status) =>
                {
                    if(!status || !status.safeToChange)
                    {
                        return;
                    }

                    this.runCmd(
                        `cd ${this.moduleBasePath}${module} && git checkout ${to}`,
                        (data) =>
                        {
                            this.logGitAudit('changedBranch', data);

                            if(typeof thenFn === 'function')
                            {
                                thenFn(data);
                            }
                        },
                        (err) =>
                        {
                            if(typeof err === 'string' && err.startsWith('Switched to branch '))
                            {
                                console.log('changeGitBranch:', err);
                                this.logGitAudit('changedBranch', err);
                            }

                            if(typeof thenFn === 'function')
                            {
                                thenFn(err);
                            }
                        }
                    );
                }
            );
        },
        logGitAudit(type, data)
        {
            this.$log('logGitAudit', type);
            this.writeToDb(
                'git_audits',
                [{
                    time: new Date().getTime(),
                    type,
                    data
                }],
                (res) =>
                {
                    console.log('audit:', res);
                },
                {
                    dbFile: 'notesdb.json',
                    shouldMerge: true,
                    createTable: true
                }
            );
        }
    }
};