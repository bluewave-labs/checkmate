const buildUptimeDetailsPipeline = (monitor, dates, dateString) => {
	return [
		{
			$match: {
				monitorId: monitor._id,
			},
		},
		{
			$sort: {
				createdAt: 1,
			},
		},
		{
			$facet: {
				aggregateData: [
					{
						$group: {
							_id: null,
							avgResponseTime: {
								$avg: "$responseTime",
							},
							firstCheck: {
								$first: "$$ROOT",
							},
							lastCheck: {
								$last: "$$ROOT",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				uptimeDuration: [
					{
						$match: {
							status: false,
						},
					},
					{
						$sort: {
							createdAt: 1,
						},
					},
					{
						$group: {
							_id: null,
							lastFalseCheck: {
								$last: "$$ROOT",
							},
						},
					},
				],
				groupChecks: [
					{
						$match: {
							createdAt: { $gte: dates.start, $lte: dates.end },
						},
					},
					{
						$group: {
							_id: {
								$dateToString: {
									format: dateString,
									date: "$createdAt",
								},
							},
							avgResponseTime: {
								$avg: "$responseTime",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
					{
						$sort: {
							_id: 1,
						},
					},
				],
				groupAggregate: [
					{
						$match: {
							createdAt: { $gte: dates.start, $lte: dates.end },
						},
					},
					{
						$group: {
							_id: null,
							avgResponseTime: {
								$avg: "$responseTime",
							},
						},
					},
				],
				upChecksAggregate: [
					{
						$match: {
							status: true,
						},
					},
					{
						$group: {
							_id: null,
							avgResponseTime: {
								$avg: "$responseTime",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				upChecks: [
					{
						$match: {
							status: true,
							createdAt: { $gte: dates.start, $lte: dates.end },
						},
					},
					{
						$group: {
							_id: {
								$dateToString: {
									format: dateString,
									date: "$createdAt",
								},
							},
							totalChecks: {
								$sum: 1,
							},
							avgResponseTime: {
								$avg: "$responseTime",
							},
						},
					},
					{
						$sort: { _id: 1 },
					},
				],
				downChecksAggregate: [
					{
						$match: {
							status: false,
						},
					},
					{
						$group: {
							_id: null,
							avgResponseTime: {
								$avg: "$responseTime",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				downChecks: [
					{
						$match: {
							status: false,
							createdAt: { $gte: dates.start, $lte: dates.end },
						},
					},
					{
						$group: {
							_id: {
								$dateToString: {
									format: dateString,
									date: "$createdAt",
								},
							},
							totalChecks: {
								$sum: 1,
							},
							avgResponseTime: {
								$avg: "$responseTime",
							},
						},
					},
					{
						$sort: { _id: 1 },
					},
				],
			},
		},
		{
			$project: {
				avgResponseTime: {
					$arrayElemAt: ["$aggregateData.avgResponseTime", 0],
				},
				totalChecks: {
					$arrayElemAt: ["$aggregateData.totalChecks", 0],
				},
				latestResponseTime: {
					$arrayElemAt: ["$aggregateData.lastCheck.responseTime", 0],
				},
				timeSinceLastCheck: {
					$let: {
						vars: {
							lastCheck: {
								$arrayElemAt: ["$aggregateData.lastCheck", 0],
							},
						},
						in: {
							$cond: [
								{
									$ifNull: ["$$lastCheck", false],
								},
								{
									$subtract: [new Date(), "$$lastCheck.createdAt"],
								},
								0,
							],
						},
					},
				},
				timeSinceLastFalseCheck: {
					$let: {
						vars: {
							lastFalseCheck: {
								$arrayElemAt: ["$uptimeDuration.lastFalseCheck", 0],
							},
							firstCheck: {
								$arrayElemAt: ["$aggregateData.firstCheck", 0],
							},
						},
						in: {
							$cond: [
								{
									$ifNull: ["$$lastFalseCheck", false],
								},
								{
									$subtract: [new Date(), "$$lastFalseCheck.createdAt"],
								},
								{
									$cond: [
										{
											$ifNull: ["$$firstCheck", false],
										},
										{
											$subtract: [new Date(), "$$firstCheck.createdAt"],
										},
										0,
									],
								},
							],
						},
					},
				},
				groupChecks: "$groupChecks",
				groupAggregate: {
					$arrayElemAt: ["$groupAggregate", 0],
				},
				upChecksAggregate: {
					$arrayElemAt: ["$upChecksAggregate", 0],
				},
				upChecks: "$upChecks",
				downChecksAggregate: {
					$arrayElemAt: ["$downChecksAggregate", 0],
				},
				downChecks: "$downChecks",
			},
		},
	];
};

const buildHardwareDetailsPipeline = (monitor, dates, dateString) => {
	return [
		{
			$match: {
				monitorId: monitor._id,
				createdAt: { $gte: dates.start, $lte: dates.end },
			},
		},
		{
			$sort: {
				createdAt: 1,
			},
		},
		{
			$facet: {
				aggregateData: [
					{
						$group: {
							_id: null,
							latestCheck: {
								$last: "$$ROOT",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				upChecks: [
					{
						$match: {
							status: true,
						},
					},
					{
						$group: {
							_id: null,
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				checks: [
					{
						$limit: 1,
					},
					{
						$project: {
							diskCount: {
								$size: "$disk",
							},
						},
					},
					{
						$lookup: {
							from: "hardwarechecks",
							let: {
								diskCount: "$diskCount",
							},
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$monitorId", monitor._id] },
												{ $gte: ["$createdAt", dates.start] },
												{ $lte: ["$createdAt", dates.end] },
											],
										},
									},
								},
								{
									$group: {
										_id: {
											$dateToString: {
												format: dateString,
												date: "$createdAt",
											},
										},
										avgCpuUsage: {
											$avg: "$cpu.usage_percent",
										},
										avgMemoryUsage: {
											$avg: "$memory.usage_percent",
										},
										avgTemperatures: {
											$push: {
												$ifNull: ["$cpu.temperature", [0]],
											},
										},
										disks: {
											$push: "$disk",
										},
									},
								},
								{
									$project: {
										_id: 1,
										avgCpuUsage: 1,
										avgMemoryUsage: 1,
										avgTemperature: {
											$map: {
												input: {
													$range: [
														0,
														{
															$size: {
																// Handle null temperatures array
																$ifNull: [
																	{ $arrayElemAt: ["$avgTemperatures", 0] },
																	[0], // Default to single-element array if null
																],
															},
														},
													],
												},
												as: "index",
												in: {
													$avg: {
														$map: {
															input: "$avgTemperatures",
															as: "tempArray",
															in: {
																$ifNull: [
																	{ $arrayElemAt: ["$$tempArray", "$$index"] },
																	0, // Default to 0 if element is null
																],
															},
														},
													},
												},
											},
										},
										disks: {
											$map: {
												input: {
													$range: [0, "$$diskCount"],
												},
												as: "diskIndex",
												in: {
													name: {
														$concat: [
															"disk",
															{
																$toString: "$$diskIndex",
															},
														],
													},
													readSpeed: {
														$avg: {
															$map: {
																input: "$disks",
																as: "diskArray",
																in: {
																	$arrayElemAt: [
																		"$$diskArray.read_speed_bytes",
																		"$$diskIndex",
																	],
																},
															},
														},
													},
													writeSpeed: {
														$avg: {
															$map: {
																input: "$disks",
																as: "diskArray",
																in: {
																	$arrayElemAt: [
																		"$$diskArray.write_speed_bytes",
																		"$$diskIndex",
																	],
																},
															},
														},
													},
													totalBytes: {
														$avg: {
															$map: {
																input: "$disks",
																as: "diskArray",
																in: {
																	$arrayElemAt: [
																		"$$diskArray.total_bytes",
																		"$$diskIndex",
																	],
																},
															},
														},
													},
													freeBytes: {
														$avg: {
															$map: {
																input: "$disks",
																as: "diskArray",
																in: {
																	$arrayElemAt: ["$$diskArray.free_bytes", "$$diskIndex"],
																},
															},
														},
													},
													usagePercent: {
														$avg: {
															$map: {
																input: "$disks",
																as: "diskArray",
																in: {
																	$arrayElemAt: [
																		"$$diskArray.usage_percent",
																		"$$diskIndex",
																	],
																},
															},
														},
													},
												},
											},
										},
									},
								},
							],
							as: "hourlyStats",
						},
					},
					{
						$unwind: "$hourlyStats",
					},
					{
						$replaceRoot: {
							newRoot: "$hourlyStats",
						},
					},
				],
			},
		},
		{
			$project: {
				aggregateData: {
					$arrayElemAt: ["$aggregateData", 0],
				},
				upChecks: {
					$arrayElemAt: ["$upChecks", 0],
				},
				checks: {
					$sortArray: {
						input: "$checks",
						sortBy: { _id: 1 },
					},
				},
			},
		},
	];
};

export { buildUptimeDetailsPipeline, buildHardwareDetailsPipeline };
