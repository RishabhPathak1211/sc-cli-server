import { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorator/controller';
import { Route } from '../decorator/route';
import { adminUpload, getFileBuffer, upload } from '../utils/fileUtils';
import { Authenticate } from '../decorator/authenticate';

interface ITemplateFileMapping {
    project: string;
    package: string;
    sdk: string;
}

const templateToFileMapping: ITemplateFileMapping  = {
    project: 'project_template.zip',
    package: 'package_template.zip',
    sdk: 'salescode_sdk.zip'
}

@Controller('/template')
class TemplateController {
    @Route('get', '/:templateType')
    @Authenticate('consumerKey')
    async getTemplate(req: Request<{ templateType: keyof ITemplateFileMapping }>, res: Response, next: NextFunction) {
        let { templateType } = req.params;

        if (!templateType) {
            templateType = 'project';
        }

        try {
            return res.status(200).json({
                templateBuffer: await getFileBuffer(templateToFileMapping[templateType])
            })
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @Route('post', '', adminUpload.single('template'))
    @Authenticate('token')
    async uploadNewTemplate(req: Request, res: Response, next: NextFunction) {
        const { username } = req.user || { username: undefined };

        if (!username || username !== 'admin') {
            return res.status(403).json({ error: 'User not authorized to perform this action' });
        }
    }
}

export default TemplateController;
