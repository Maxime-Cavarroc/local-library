<script lang="ts">
	import { currentUser, logout } from '../../../lib/stores/authentication';
	import Secured from '../../../lib/components/Secured.svelte';

	function handleLogout(): void {
		logout();
		window.location.href = '/auth/login';
	}
</script>

<Secured>
	<div class="bg-white">
		<div class="w-full px-4 py-4 sm:px-6 lg:px-8">
			<div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
				<div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

                <div class="group relative">
					<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
						<img
							src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"
							alt="Front of men&#039;s Basic Tee in black."
							class="size-full object-cover object-center lg:size-full"
						/>
					</div>
					<div class="mt-4 flex justify-between">
						<div>
							<h3 class="text-sm text-gray-700">
								<a href="#">
									<span aria-hidden="true" class="absolute inset-0"></span>
									Basic Tee
								</a>
							</h3>
							<p class="mt-1 text-sm text-gray-500">Black</p>
						</div>
						<p class="text-sm font-medium text-gray-900">$35</p>
					</div>
				</div>

				<!-- More products... -->
			</div>
		</div>
	</div>
</Secured>
