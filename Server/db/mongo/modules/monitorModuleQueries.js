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
							lastCheck: {
								$last: "$$ROOT",
							},
							totalChecks: {
								$sum: 1,
							},
						},
					},
				],
				uptimeStreak: [
					{
						$sort: {
							createdAt: -1,
						},
					},
					{
						$group: {
							_id: null,
							checks: { $push: "$$ROOT" },
						},
					},
					{
						$project: {
							streak: {
								$reduce: {
									input: "$checks",
									initialValue: { checks: [], foundFalse: false },
									in: {
										$cond: [
											{
												$and: [
													{ $not: "$$value.foundFalse" }, // stop reducing if a false check has been found
													{ $eq: ["$$this.status", true] }, // continue reducing if current check true
												],
											},
											// true case
											{
												checks: { $concatArrays: ["$$value.checks", ["$$this"]] },
												foundFalse: false, // Add the check to the streak
											},
											// false case
											{
												checks: "$$value.checks",
												foundFalse: true, // Mark that we found a false
											},
										],
									},
								},
							},
						},
					},
				],
				// For the response time chart, should return checks for date window
				// Grouped by: {day: hour}, {week: day}, {month: day}
				groupedChecks: [
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
				// Average response time for the date window
				groupAvgResponseTime: [
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
				// All UpChecks for the date window
				upChecks: [
					{
						$match: {
							status: true,
							createdAt: { $gte: dates.start, $lte: dates.end },
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
				// Up checks grouped by: {day: hour}, {week: day}, {month: day}
				groupedUpChecks: [
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
				// All down checks for the date window
				downChecks: [
					{
						$match: {
							status: false,
							createdAt: { $gte: dates.start, $lte: dates.end },
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
				// Down checks grouped by: {day: hour}, {week: day}, {month: day} for the date window
				groupedDownChecks: [
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
				uptimeStreak: {
					$cond: [
						{ $eq: [{ $size: { $first: "$uptimeStreak.streak.checks" } }, 0] },
						0,
						{
							$subtract: [
								new Date(),
								{
									$last: { $first: "$uptimeStreak.streak.checks.createdAt" },
								},
							],
						},
					],
				},
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
				groupedChecks: "$groupedChecks",
				groupedAvgResponseTime: {
					$arrayElemAt: ["$groupAvgResponseTime", 0],
				},
				upChecks: {
					$arrayElemAt: ["$upChecks", 0],
				},
				groupedUpChecks: "$groupedUpChecks",
				downChecks: {
					$arrayElemAt: ["$downChecks", 0],
				},
				groupedDownChecks: "$groupedDownChecks",
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

const buildDistributedUptimeDetailsPipeline = (monitor, dates, dateString) => {
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
							lastCheck: {
								$last: "$$ROOT",
							},
							totalChecks: {
								$sum: 1,
							},
							uptBurnt: {
								$sum: "$uptBurnt",
							},
						},
					},
				],
				// For the response time chart, should return checks for date window
				// Grouped by: {day: hour}, {week: day}, {month: day}
				groupedMapChecks: [
					{
						$match: {
							createdAt: { $gte: dates.start, $lte: dates.end },
						},
					},
					{
						$group: {
							_id: {
								date: {
									$dateToString: {
										format: dateString,
										date: "$createdAt",
									},
								},
								city: "$city",
								lat: "$location.lat",
								lng: "$location.lng",
							},
							city: { $first: "$city" }, // Add this line to include city in output
							lat: { $first: "$location.lat" },
							lng: { $first: "$location.lng" },
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
							"_id.date": 1,
						},
					},
				],
				groupedChecks: [
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
				// Average response time for the date window
				groupAvgResponseTime: [
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
				latestChecks: [
					{
						$sort: { createdAt: -1 }, // Sort by newest first
					},
					{
						$limit: 5, // Get only the first 5 documents
					},
					{
						$project: {
							responseTime: 1,
							city: 1,
							countryCode: 1,
							uptBurnt: { $toString: "$uptBurnt" },
						},
					},
				],
			},
		},
		{
			$project: {
				totalUptBurnt: {
					$toString: {
						$arrayElemAt: ["$aggregateData.uptBurnt", 0],
					},
				},
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
				groupedMapChecks: "$groupedMapChecks",
				groupedChecks: "$groupedChecks",
				groupedAvgResponseTime: {
					$arrayElemAt: ["$groupAvgResponseTime", 0],
				},
				latestChecks: "$latestChecks",
			},
		},
	];
};

export {
	buildUptimeDetailsPipeline,
	buildHardwareDetailsPipeline,
	buildDistributedUptimeDetailsPipeline,
};
