import Handler from "@backend/modules/Handler";
import {Prisma} from ".prisma/client";
import PrismaSchema, {handlePrismaModuleDocumentation} from "../../../../prisma/PrismaInfo";
import {User} from "@prisma/client";
import {generateModulePostJson} from "@backend/utils/request";
import {merge} from "lodash";
import UserDelegate = Prisma.UserDelegate;

import ModelName = Prisma.ModelName;
import {entries, fromEntries} from "@/utils/built-in";


class FullAccessModuleHandler<
	T extends UserDelegate | { [key: string | symbol]: any },
	CreateType,
> extends Handler {
	async GET() {
		const id = this.getTargetId();
		if (id) {
			const find = await this.getPrismaModel()?.findUnique(
				await this.GET_findFirst(id),
			);
			if (!find) {
				throw {
					message: this.getName() + " یافت نشد",
					code: 404,
				};
			}
			return await this.filter(find);
		} else if (this.request.nextUrl.searchParams.has("id")) {
			throw {
				message: `نشانه ${this.getName()} نامعتبر!`,
				code: 400,
			};
		} else {
			let o = await this.GET_findFirst(0);

			// @ts-ignore
			delete o.where?.id;


			const pagination = this.get('_pagination') === "true" || this.enablePagination();
			let total = 0;

			if (pagination) {
				const take = +this.get('_take') || 10;
				const skip = +this.get('_skip') || 0;
				if (take > 10) throw ("بازه دریافت بیش از حد میباشد!")
				total = await this.getPrismaModel()?.count({
					where: o.where
				});
				o.skip = skip;
				o.take = take;
				if (o?.select && o?.include) {
					delete o.include;
				}
			}

			const all = await this.getPrismaModel()?.findMany(o);
			const result = await Promise.all((
				all?.map?.(async (o: CreateType) => await this.filter(o))
			))
			return pagination ? {
				additional: {
					total,
					data: result
				}
			} : result;
		}
	}

	getPrismaFields(): typeof PrismaSchema[0]['fields'] {
		// @ts-ignore
		const modelName = this.getPrismaModel().name;
		return PrismaSchema.find(m => m.name === modelName)?.fields ?? []
	}

	async GET_findFirst(id: any): Promise<any> {
		let include: any = undefined;
		if (!!id && this.isFullAccess()) {
			include = {};
			const fields = this.getPrismaFields();
			fields.filter(f => f.kind === 'object').forEach(f => {
				include[f.name] = true;
			});
		}
		let defaultValue = {
			where: {
				id: id
			},
			include
		}

		if (await this.enableQueryFilter()) {
			const queryFilter = await this.queryFilter();
			return merge({}, queryFilter, defaultValue);
		}

		return defaultValue
	}


	getTargetId(): string | number | undefined {
		const id = this.json?.id ?? this.requestCloned.nextUrl.searchParams.get("id");
		// @ts-ignore
		const modelName = this.getPrismaModel().name;
		const fields = PrismaSchema.find(m => m.name === modelName)?.fields ?? [];
		const idField = fields.find(f => f.name === 'id');

		if (idField?.type === 'String' && !!id) {
			return id + "";
		}
		return isNaN(+id) ? id : +id;
	}


	async queryFilter() {
		// @ts-ignore
		const modelName = this.getPrismaModel().name;
		const fields = PrismaSchema.find(m => m.name === modelName)?.fields ?? [];
		let where: any = {};
		let include: any = {};


		fields.forEach(field => {
			let {name} = field;
			if (field.kind === 'object') {
				name = field.relationFromFields?.[0] + "";
			}
			let value = this.get(name);

			if (!!value && !where[name]) {
				if (field.type.includes("Int")) {
					where[name] = +value;
				} else {
					where[name] = value;
				}

				if (field.kind === 'object') {
					include[field.name] = true
				}
			}
		});


		const customInclude = this.get("_include") as string;
		if (customInclude) {
			const list = customInclude.split(",");
			list.forEach(item => {
				let findField = fields.find(f => f.name === item);
				if (findField?.kind === 'object') {
					const ownFilter = this.get(item) as string;
					if (ownFilter) {
						const ownFields = PrismaSchema.find(m => m.name === findField?.type)?.fields ?? [];
						let finalFields: any = {};
						let filters = ownFilter.split(",")

						filters.forEach(filter => {
							if (ownFields.find(f => f.name === filter)) {
								finalFields[filter] = true
							}
						});

						if (Object.keys(finalFields).length) {
							include[item] = {
								select: finalFields
							}
						} else {
							include[item] = true;
						}
					} else {
						include[item] = true;
					}
				}
			})
		}
		return {
			where,
			include
		};
	}

	enablePagination() {
		return false;
	}

	isFullAccess() {
		const parentName = Object.getPrototypeOf(this.constructor).name;
		return parentName === FullAccessModuleHandler.name;
	}

	async PATCH() {

		if (this.isFullAccess() && await this.enableQueryFilter()) {
			return await this.advancedPrismaFindQuery();
		}
		this.methodDeny();
	}

	async advancedPrismaFindQuery() {
		// @ts-ignore
		const modelName = this.getPrismaModel().name;
		const fields = PrismaSchema.find(m => m.name === modelName)?.fields ?? [];
		const keys = Object.keys(this.json);
		const {length} = keys;

		if (!length) {
			let rendered = [modelName];

			// @ts-ignore
			function echo(field: typeof fields[0] | undefined) {
				if (!field) {
					return {};
				}

				let typeInfo: any[] = [];
				if (field.kind === 'object') {
					const model = PrismaSchema.find(m => field.type === m.name && m.name !== modelName);
					if (model && !rendered.includes(model.name)) {
						rendered.push(model.name);
						model.fields.map(field => {
							typeInfo.push(echo(field))
						})
					}
				}

				return ({
					key: field.name,
					name: field.info?.name ?? fields.find(f => f.name === field.name + "Id")?.info?.name?.replace("نشانه", "شئ") ?? field.name,
					type: field.type,
					typeInfo
				});
			}

			return {
				modelName,
				fields: fields.map(echo)
			};
		}

		let defaultPayload = this.GET_findFirst(undefined);

		let where = this.json;
		let include = where.include ?? undefined;
		let select = where.select ?? undefined;
		delete where.select;
		delete where.include;

		if (include === true) {
			include = {};
			fields.filter(f => f.kind === 'object').map(f => {
				include[f.name] = true
			});
		}

		if (include) {

			let checkUp = true;
			for (let value of Object.values(include)) {
				if (value !== false) {
					checkUp = false;
					break;
				}
			}

			if (checkUp) {
				fields.filter(f => f.kind === 'object' && !Object.keys(include).includes(f.name)).forEach(f => {
					include[f.name] = true
				})
			}

			Object.entries(include).map(([key, value]: any) => {
				if (typeof value === 'object' && !value?.select) {
					include[key] = {
						select: value
					}
				}
			});
		}


		return this.getPrismaModel()?.findMany(merge({
			include,
			select
		}, {
			where
		}, defaultPayload))
	}

	async getWhereCondition() {
		const id = this.getTargetId();
		const where = (await this.GET_findFirst(id))?.where ?? {where: {id}};

		// @ts-ignore
		const modelName = this.getPrismaModel().name;
		const fields = PrismaSchema.find(m => m.name === modelName)?.fields ?? [];

		return fromEntries(entries(where).filter(([key, v]) => fields.find(f => f.name === key && (f.isUnique || f.isId || f.relationName))))
	}

	/**
	 *
	 * @constructor
	 */
	async DELETE(): Promise<any> {
		const id = this.getTargetId();
		if (id === 'all') {
			const user = await this.getUser();
			if (/*user?.role !== 'ADMIN' TODO: PAY ATTENTION*/ true) {
				await this.getPrismaModel()?.deleteMany();
				return this.msg(`تمام ${this.getName()} ها پاک شده اند`)
			} else throw ({
				code: 403,
				message: "دسترسی رد شد"
			})
		}

		try {
			await this.getPrismaModel()?.delete({
				where: await this.getWhereCondition()
			});
		} catch (e) {
			// @ts-ignore
			if (e?.message?.includes("not exist")) {
				throw ({
					code: 404,
					message: this.getName() + " یافت نشد"
				})
			}
			throw (e);
		}
		return this.msg(this.getName() + " باموفقیت حذف شد");
	}

	async POST() {
		const id = this.getTargetId();
		let whereCond = {...(await this.getWhereCondition())};

		if (id) {
			const obj: CreateType = await this.getPrismaModel()?.findUnique({
				where: whereCond,
			});
			if (obj) {
				return (await this?.edit?.(obj)) ?? this.msg("باموفقیت ویرایش شد");
			} else {
				throw {
					code: 400,
					message: `${this.getName()} جهت ویرایش یافت نشد!`,
				};
			}
		} else {
			return (await this?.create?.(this.json)) ?? this.msg("باموفقیت ساخته شد");
		}
	}

	async handler(method: string): Promise<any> {
		try {
			return await super.handler(method);
		} catch (e: any) {
			if (typeof e?.code === "string") {
				if (!e.message) e.message = "خطا در انجام عملیات";
				e.code = 500;
			}
			throw e;
		}
	}

	getPrismaModel(): T | undefined | { [key: string | symbol]: any } {
		return undefined;
	}

	filter(obj: any): CreateType | any {
		const keys: any = this.getOutputKeys();
		if (!keys.length) {
			return obj;
		} else {
			// @ts-ignore
			return Object.fromEntries(
				Object.entries(obj).filter(([key]) => keys.includes(key)),
			);
		}
	}

	getOutputKeys(): Array<keyof CreateType> {
		return [];
	}

	getName(): string {
		// @ts-ignore
		return this.getPrismaModel()?.name ?? "unknown module";
	}

	async create(body: any): Promise<any> {
		const fields = await this.getRequiredFields("create");

		if (!fields) {
			throw {
				message: `امکان ساخت ${this.getName()} امکان پذیر نیست!`,
				code: 405,
			};
		}

		await this.before('create', fields);
		let whereCond = await this.getWhereCondition();
		delete whereCond.id;
		return this.getPrismaModel()?.create({
			data: {
				...fields,
				...whereCond
			},
		});
	}

	async edit(model: any): Promise<any> {
		const fields = await this.getRequiredFields("edit");

		if (!fields) {
			throw {
				message: `امکان ویرایش ${this.getName()} امکان پذیر نیست! `,
				code: 405,
			};
		}

		if (!Object.keys(fields).length) {
			throw ("محتوایی ارسال نشد");
		}


		await this.before('edit', fields);
		const whereCond = await this.getWhereCondition();
		return this.getPrismaModel()?.update({
			where: whereCond,
			data: fields,
		});
	}

	async getRequiredFields(operation: "create" | "edit"): Promise<any> {
		// @ts-ignore
		const name = this.getPrismaModel()?.name as ModelName;
		const json = generateModulePostJson(name, operation === 'create');
		return this.enableDefaultFieldsGenerator() ? this.$_POST(json) : undefined;
	}

	enableDefaultFieldsGenerator() {
		return this.isFullAccess();
	}

	async OPTIONS() {
		const user = await this.getUser();

		if (/*user.role === 'DEFAULT' TODO: Pay Attention*/ false) {
			this.methodDeny();
		}

		// @ts-ignore
		const model = PrismaSchema.find(m => m.name === this.getPrismaModel()?.$name);

		return model?.fields.filter(f => !f.relationName && f.isRequired && !f.isId).filter(f => !!f.info?.name).map(f => {
			const values = Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => v.name);
			// @ts-ignore
			const labels = Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => handlePrismaModuleDocumentation(v?.documentation + "")?.name).filter(n => !!n);

			return ({
				key: f.name,
				name: f.info?.name,
				defaultValue: f.default,
				type: !values?.length ? "INPUT" : "SELECT",
				...(values?.length && {values}),
				...(labels?.length && {labels})
			})
		})
	}


	canEdit() {
		return true;
	}

	canCreate() {
		return true;
	}

	async beforeCreate(fields: any) {

	}

	async beforeEdit(fields: any) {

	}

	async enableQueryFilter() {
		return this.isFullAccess();
	}

	async before(action: "create" | "edit", payload: any) {
		if (action === 'create') {
			if (!this.canCreate()) {
				throw ({
					code: 403,
					message: `نمیتوان ${this.getName()} ساخت.`
				});
			}
			await this.beforeCreate(payload);
		}

		if (action === 'edit') {
			if (!this.canEdit()) {
				throw ({
					code: 403,
					message: `نمیتوان ${this.getName()} را ویرایش کرد.`
				})
			}
			await this.beforeEdit(payload);
		}
	}

	async PUT(model: any) {
		return await this.create(model);
	}
}

export default FullAccessModuleHandler;
