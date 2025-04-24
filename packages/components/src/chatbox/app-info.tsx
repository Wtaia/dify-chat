import { Tag } from 'antd'

interface IAppInfoProps {
	info: {
		name: string
		description: string
		tags?: string[]
	}
}

/**
 * 应用信息
 */
export function AppInfo(props: IAppInfoProps) {
	const { info } = props
	return (
		<div className="text-default pt-3" style={{width:'60%', lineHeight:'30%'}}>
			<div className="flex items-center px-4 mt-3">
					<img
						style={{width:'20px' ,height:'20px'}}
						src='https://free4.yunpng.top/2025/04/22/68076d3f95f86.png'
						draggable={false}
						alt="logo"
					/>
				<div className="ml-3 text-default text-sm truncate" style={{fontSize:'medium',fontWeight:'bolder'}}>{info.name}</div>
			</div>
			{info.tags ? (
				<div className="mt-3 px-4">
					{info.tags.map(tag => {
						return (
							<Tag
								key={tag}
								className="mb-2"
							>
								{tag}
							</Tag>
						)
					})}
				</div>
			) : null}
		</div>
	)
}
