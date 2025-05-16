import {
	CommentOutlined,
	FireOutlined,
	HeartOutlined,
	ReadOutlined,
	SmileOutlined,
} from '@ant-design/icons'
import { Prompts, Welcome } from '@ant-design/x'
import { IGetAppParametersResponse } from '@dify-chat/api'
import { IDifyAppItem } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { FormInstance, GetProp, Space } from 'antd'
import classNames from 'classnames'
import { useMemo } from 'react'

import AppInputWrapper from './app-input-wrapper'

const renderTitle = (icon: React.ReactElement, title: string) => (
	<Space align="start">
		{icon}
		<span>{title}</span>
	</Space>
)

interface IWelcomePlaceholderProps {
	/**
	 * 是否展示提示项
	 */
	showPrompts: boolean
	/**
	 * 应用参数
	 */
	appParameters?: IGetAppParametersResponse
	/**
	 * 点击提示项时触发的回调函数
	 */
	onPromptItemClick: GetProp<typeof Prompts, 'onItemClick'>
	/**
	 * 表单是否填写
	 */
	formFilled: boolean
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void
	/**
	 * 表单数据
	 */
	user_input_form?: IGetAppParametersResponse['user_input_form']
	/**
	 * 当前对话 ID
	 */
	conversationId?: string
	/**
	 * 应用入参的表单实例
	 */
	entryForm: FormInstance<Record<string, unknown>>
	/**
	 * 当前应用基本信息
	 */
	appConfig?: IDifyAppItem
}

/**
 * 对话内容区的欢迎占位符
 */
export const WelcomePlaceholder = (props: IWelcomePlaceholderProps) => {
	const { onPromptItemClick, appParameters, showPrompts, appConfig } = props
	const isMobile = useIsMobile()

	const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = useMemo(() => {
		const DefaultPlaceholderPromptsItems = [
			{
				key: '1',
				label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, '热点问题'),
				description: 'What are you interested in?',
				children: [
					{
						key: '1-1',
						description: `What's new in X?`,
					},
					{
						key: '1-2',
						description: `What's AGI?`,
					},
					{
						key: '1-3',
						description: `Where is the doc?`,
					},
				],
			},
			{
				key: '2',
				label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
				description: 'How to design a good product?',
				children: [
					{
						key: '2-1',
						icon: <HeartOutlined />,
						description: `Know the well`,
					},
					{
						key: '2-2',
						icon: <SmileOutlined />,
						description: `Set the AI role`,
					},
					{
						key: '2-3',
						icon: <CommentOutlined />,
						description: `Express the feeling`,
					},
				],
			},
		]
		if (appParameters?.suggested_questions) {
			return [
				{
					key: 'remote',
					label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, '热点问题'),
					description: '',
					children: appParameters.suggested_questions.map(item => {
						return {
							key: 'remote',
							description: item,
						}
					}),
				},
			]
		}
		if (isMobile) {
			return DefaultPlaceholderPromptsItems.slice(0, 1)
		}
		return DefaultPlaceholderPromptsItems
	}, [isMobile])

	return (
		<div className="flex justify-center w-full px-3 box-border mx-auto">
			<Space
				direction="vertical"
				className={classNames({
					'w-full md:!w-3/4': true,
					'pb-6': !showPrompts && props.user_input_form?.length,
					'pt-3': showPrompts,
				})}
			>
				{showPrompts ? (
					<>
						<Welcome
							variant="borderless"
							icon={
								<div className="flex items-center justify-center rounded-[50%] w-16 h-16 border-gray-100 border-solid border-[1px] bg-[#eff0f5]">
									{/*<LogoIcon/>*/}
									<img
										// className="w-5 h-5 inline-block"
										// src='../assets/images/logo.png'
										src="https://free4.yunpng.top/2025/04/22/68076d3f95f86.png"
										draggable={false}
										alt="logo"
									/>
								</div>
							}
							title={appParameters?.opening_statement || '您好，我是财欣智能功能导航助手'}
							description=""
							// extra={
							// 	<Space>
							// 		<Button icon={<ShareAltOutlined />} />
							// 		<Button icon={<EllipsisOutlined />} />
							// 	</Space>
							// }
						/>
					</>
				) : null}

				{/* 应用输入参数 */}
				<AppInputWrapper
					formFilled={props.formFilled}
					onStartConversation={props.onStartConversation}
					user_input_form={props.user_input_form}
					entryForm={props.entryForm}
					conversationId={props.conversationId!}
					appConfig={appConfig}
				/>

				{showPrompts ? (
					<div style={{ width: '100%' }}>
						<Prompts
							className="mt-4"
							// title="问一问："
							vertical={isMobile}
							items={placeholderPromptsItems}
							styles={{
								list: {
									width: '100%',
								},
								item: isMobile
									? {
											width: '100%',
										}
									: {
											flex: 1,
										},
							}}
							onItemClick={onPromptItemClick}
						/>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<img
								src="https://s1.imagehub.cc/images/2025/04/24/20d06c98b78e13b219cc0cc1efad7f8e.gif"
								alt=""
								style={{ width: '30%', height: 'auto', borderRadius: '4px', marginTop: '4px' }}
							/>
						</div>
					</div>
				) : null}
			</Space>
		</div>
	)
}
