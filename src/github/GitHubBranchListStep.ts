/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { IStaticSiteWizardContext } from '../commands/createStaticWebApp/IStaticSiteWizardContext';
import { githubApiEndpoint } from '../constants';
import { ext } from '../extensionVariables';
import { createGitHubRequestOptions, getGitHubQuickPicksWithLoadMore, gitHubBranchData, gitHubWebResource, ICachedQuickPicks } from '../utils/gitHubUtils';
import { localize } from '../utils/localize';
import { nonNullProp } from '../utils/nonNull';

export class GitHubBranchListStep extends AzureWizardPromptStep<IStaticSiteWizardContext> {
    public async prompt(context: IStaticSiteWizardContext): Promise<void> {
        const placeHolder: string = localize('chooseBranch', 'Choose branch');
        let branchData: gitHubBranchData | undefined;
        const picksCache: ICachedQuickPicks<gitHubBranchData> = { picks: [] };
        do {
            branchData = (await ext.ui.showQuickPick(this.getBranchPicks(context, picksCache), { placeHolder })).data;
        } while (!branchData);

        context.branchData = branchData;
    }

    public shouldPrompt(context: IStaticSiteWizardContext): boolean {
        return !context.branchData;
    }

    private async getBranchPicks(context: IStaticSiteWizardContext, picksCache: ICachedQuickPicks<gitHubBranchData>): Promise<IAzureQuickPickItem<gitHubBranchData | undefined>[]> {
        const repoHtmlUrl: string = nonNullProp(context, 'repoHtmlUrl');
        const owner: string = repoHtmlUrl.split('/')[3];
        const repo: string = repoHtmlUrl.split('/')[4];
        const requestOption: gitHubWebResource = await createGitHubRequestOptions(context, `${githubApiEndpoint}/repos/${owner}/${repo}/branches`);
        return await getGitHubQuickPicksWithLoadMore<gitHubBranchData>(picksCache, requestOption, 'name');
    }
}