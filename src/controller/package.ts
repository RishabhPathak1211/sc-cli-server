import { NextFunction, Request, Response } from 'express';
import { NoSuchKey } from '@aws-sdk/client-s3';
import { Controller } from '../decorator/controller';
import { Route } from '../decorator/route';
import { getFileBuffer, upload } from '../utils/fileUtils';
import Joi from 'joi';
import { Validate } from '../decorator/validate';
import { Package, PackageStatus } from '../models/package';
import { Authenticate } from '../decorator/authenticate';

type validation = {
    packageName: string;
    dependencyList: string[];
};

type userPackagesQuery = {
    status: PackageStatus;
}

const packageBodyValidation = Joi.object<validation>({
    packageName: Joi.string().required(),
    dependencyList: Joi.array<string>()
});

const userPackagesQueryValidation = Joi.object<userPackagesQuery>({
    status: Joi.string().valid('PUBLISHED', 'PENDING')
});

interface IUploadBody {
    packageName: string;
    dependencyList?: string[];
}

interface IPackageBuffer {
    packageName: string;
    buffer?: Buffer;
}

@Controller('/package')
class PackageController {
    @Route('post', '/upload', upload.single('file'))
    @Validate(packageBodyValidation, 'body')
    @Authenticate('consumerKey')
    async uploadPackage(req: Request<{}, {}, IUploadBody>, res: Response, next: NextFunction) {
        if (!req.file) {
            res.status(409).json({ error: 'Unable to upload file' });
        }

        const { packageName, dependencyList } = req.body;

        const packageExists = await Package.findOne({ packageName });

        if (packageExists) {
            return res.status(409).json({ error: 'Package Name already exits' });
        }

        const dependencies = dependencyList
            ? await Package.find({
                  packageName: { $in: dependencyList }
              })
            : [];

        const newPackage = new Package({
            packageName,
            fileName: req.file!.key,
            user: req.user!.id,
            dependencies: dependencies.map((dependency) => dependency._id)
        });

        try {
            await newPackage.save();
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        return res.status(201).json({ status: 'success' });
    }

    @Route('get')
    @Validate(userPackagesQueryValidation, 'query')
    @Authenticate('token')
    async getUserPackages(req: Request<{}, {}, {}, { status: PackageStatus }>, res: Response, next: NextFunction) {
        const { id } = req.user!;
        const { status } = req.query;

        try {
            const userPackages = await Package.find({ user: id, status }).select('-dependencies -user -fileName -status');
            return res.status(200).json({ packages: userPackages });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @Route('get', '/all')
    async getAllPackages(req: Request, res: Response, next: NextFunction) {
        try {
            const globalPackageList = await Package.find({ status: 'PUBLISHED' })
                .populate('user', 'username email -_id')
                .select('-dependencies -fileName -status');
            return res.status(200).json({ packages: globalPackageList });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @Route('get', '/:packageName')
    @Validate(packageBodyValidation, 'params')
    @Authenticate('consumerKey')
    async getPackageWithDependencies(req: Request<validation>, res: Response, next: NextFunction) {
        const { packageName } = req.params;

        try {
            const document = await Package.findOne({ packageName }).populate('dependencies');

            if (document && document.status === 'PUBLISHED') {
                const fileList: (
                    | {
                          packageName: string;
                          fileName: string;
                      }
                    | undefined
                )[] = [
                    { packageName: document.packageName, fileName: document.fileName },
                    ...document.dependencies.map((dependency) => {
                        if ('fileName' in dependency) {
                            return {
                                packageName: dependency.packageName,
                                fileName: dependency.fileName
                            };
                        }
                    })
                ];

                const bufferList: IPackageBuffer[] = await Promise.all(
                    fileList.map(async (file) => {
                        return {
                            packageName: file!.packageName,
                            buffer: await getFileBuffer(file!.fileName)
                        };
                    })
                );

                return res.status(200).json({ packageBuffer: bufferList });
            }

            return res.status(404).json({ error: 'Package not found' });
        } catch (error) {
            console.log(error);
            if (error instanceof NoSuchKey) {
                return res.status(404).json({ error: 'Package not found' });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default PackageController;
