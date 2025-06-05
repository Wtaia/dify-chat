import { Bubble, Prompts } from '@ant-design/x'
import {
	DifyApi,
	IFile,
	IGetAppInfoResponse,
	IGetAppParametersResponse,
	IMessageItem4Render,
} from '@dify-chat/api'
import { IDifyAppItem } from '@dify-chat/core'
import { isTempId, useIsMobile } from '@dify-chat/helpers'
import { FormInstance, GetProp } from 'antd'
import { useDeferredValue, useEffect, useMemo, useRef } from 'react'

import { MessageSender } from '../message-sender'
import MessageContent from './message/content'
import MessageFooter from './message/footer'
import { WelcomePlaceholder } from './welcome-placeholder'

export interface ChatboxProps {
	/**
	 * 应用参数
	 */
	appParameters?: IGetAppParametersResponse
	/**
	 * 应用配置
	 */
	appConfig: IDifyAppItem
	/**
	 * 消息列表
	 */
	messageItems: IMessageItem4Render[]
	/**
	 * 是否正在请求
	 */
	isRequesting: boolean
	/**
	 * 下一步问题建议
	 */
	nextSuggestions: string[]
	/**
	 * 推荐 Item 点击事件
	 */
	onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'>
	/**
	 * 内容提交事件
	 * @param value 问题-文本
	 * @param files 问题-文件
	 */
	onSubmit: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
	/**
	 * 取消读取流
	 */
	onCancel: () => void
	/**
	 * 对话 ID
	 */
	conversationId: string
	/**
	 * 反馈执行成功后的回调
	 */
	feedbackCallback?: (conversationId: string) => void
	/**
	 * Dify API 实例
	 */
	difyApi: DifyApi
	/**
	 * 反馈 API
	 */
	feedbackApi: DifyApi['feedbackMessage']
	/**
	 * 上传文件 API
	 */
	uploadFileApi: DifyApi['uploadFile']
	/**
	 * 表单是否填写
	 */
	isFormFilled: boolean
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void
	/**
	 * 当前应用基本信息
	 */
	appInfo?: IGetAppInfoResponse
	/**
	 * 应用入参表单实例
	 */
	entryForm: FormInstance<Record<string, unknown>>
}

/**
 * 对话内容区
 */
export const Chatbox = (props: ChatboxProps) => {
	const {
		messageItems,
		isRequesting,
		nextSuggestions,
		onPromptsItemClick,
		onSubmit,
		onCancel,
		conversationId,
		feedbackCallback,
		difyApi,
		appParameters,
		appConfig,
		isFormFilled,
		onStartConversation,
		entryForm,
	} = props
	const isMobile = useIsMobile()

	const roles: GetProp<typeof Bubble.List, 'roles'> = {
		ai: {
			placement: 'start',
			avatar: !isMobile
				? {
						icon: (
							<img
								src="https://s1.imagehub.cc/images/2025/06/05/eea6498dad12cad336763c208c399989.png"
								draggable={false}
								alt="logo"
							/>
						),
						style: { background: '#fde3cf' },
					}
				: undefined,
			style: isMobile
				? undefined
				: {
						// 减去一个头像的宽度
						maxWidth: 'calc(100% - 44px)',
					},
		},
		user: {
			placement: 'end',
			// avatar: !isMobile
			// 	? {
			// 			// icon: <UserOutlined />,
			// 			style: {
			// 				background: '#87d068',
			// 			},
			// 		}
			// 	: undefined,
			style: isMobile
				? undefined
				: {
						// 减去一个头像的宽度
						maxWidth: 'calc(100% - 44px)',
						marginLeft: '0px',
						color: 'white',
					},
		},
	}

	const items: GetProp<typeof Bubble.List, 'items'> = useMemo(() => {
		return messageItems?.map(messageItem => {
			return {
				key: `${messageItem.id}-${messageItem.role}`,
				// 不要开启 loading 和 typing, 否则流式会无效
				// loading: status === 'loading',
				content: messageItem.content,
				messageRender: () => {
					return (
						<MessageContent
							appConfig={appConfig}
							onSubmit={onSubmit}
							messageItem={messageItem}
						/>
					)
				},
				// 用户发送消息时，status 为 local，需要展示为用户头像
				role: messageItem.role === 'local' ? 'user' : messageItem.role,
				footer: messageItem.role === 'ai' && (
					<div className="flex items-center">
						<MessageFooter
							ttsConfig={appParameters?.text_to_speech}
							feedbackApi={params => difyApi.feedbackMessage(params)}
							ttsApi={params => difyApi.text2Audio(params)}
							messageId={messageItem.id}
							messageContent={messageItem.content}
							feedback={{
								rating: messageItem.feedback?.rating,
								callback: () => {
									feedbackCallback?.(conversationId!)
								},
							}}
						/>
						{messageItem.created_at && (
							<div className="ml-3 text-sm text-desc">回复时间：{messageItem.created_at}</div>
						)}
					</div>
				),
			}
		}) as GetProp<typeof Bubble.List, 'items'>
	}, [messageItems, conversationId, difyApi, feedbackCallback, appConfig, onSubmit])

	// 监听 items 更新，滚动到最底部
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	// 延迟更新，优化性能
	const deferredItems = useDeferredValue(items)
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				behavior: 'smooth',
				top: scrollContainerRef.current.scrollHeight,
			})
		}
	}, [deferredItems])

	return (
		<div
			className="w-full h-full overflow-hidden my-0 mx-auto box-border flex flex-col gap-4 relative bg-white"
			style={{ background: 'linear-gradient(to bottom, #E1F2FE, #FFFFFF)' }}
		>
			<div
				className="w-full h-full overflow-auto pt-4 pb-48"
				ref={scrollContainerRef}
			>
				{/* 🌟 欢迎占位 + 对话参数 */}
				<WelcomePlaceholder
					showPrompts={!items?.length && isTempId(conversationId)}
					appParameters={appParameters}
					onPromptItemClick={onPromptsItemClick}
					formFilled={isFormFilled}
					onStartConversation={onStartConversation}
					user_input_form={appParameters?.user_input_form}
					conversationId={conversationId}
					entryForm={entryForm}
					appConfig={appConfig}
				/>

				<div className="flex-1 w-full md:!w-3/4 mx-auto px-3 md:px-0 box-border">
					{/* 🌟 消息列表 */}
					<Bubble.List
						items={items}
						roles={roles}
					/>

					{/* 下一步问题建议 */}
					{nextSuggestions?.length ? (
						<div className="p-3 md:pl-[44px] mt-3">
							<div className="text-desc">🤔 你可能还想问:</div>
							<div>
								{nextSuggestions?.map(item => {
									return (
										<div
											key={item}
											className="mt-3 cursor-pointer"
										>
											<div
												className="p-2 rounded-lg border border-solid border-[#eff0f5] inline-block text-sm"
												onClick={() => {
													onPromptsItemClick({
														data: {
															key: item,
															description: item,
														},
													})
												}}
											>
												{item}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					) : null}
				</div>

				<div
					className="absolute bottom-0 bg-white w-full md:!w-3/4 left-1/2"
					style={{
						transform: 'translateX(-50%)',
					}}
				>
					{/* 🌟 输入框 */}
					<div
						className="px-3"
						style={{ marginBottom: '50px' }}
					>
						<MessageSender
							appParameters={appParameters}
							onSubmit={async (...params) => {
								await entryForm.validateFields()
								return onSubmit(...params)
							}}
							isRequesting={isRequesting}
							className="w-full"
							uploadFileApi={(...params) => {
								return difyApi.uploadFile(...params)
							}}
							audio2TextApi={(...params) => difyApi.audio2Text(...params)}
							onCancel={onCancel}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
